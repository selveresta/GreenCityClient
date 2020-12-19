import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { catchError, take, takeUntil } from 'rxjs/operators';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { EcoNewsModel, NewsTagInterface } from '@eco-news-models/eco-news-model';
import { UserOwnAuthService } from '@global-service/auth/user-own-auth.service';
import { EcoNewsDto } from '@eco-news-models/eco-news-dto';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';

@Component({
  selector: 'app-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
})
export class NewsListComponent implements OnInit, OnDestroy {
  public view: boolean;
  public tagsList: Array<string>;
  public elements: EcoNewsModel[];
  public remaining = 0;
  public windowSize: number;
  public isLoggedIn: boolean;
  private currentPage: number;
  public scroll: boolean;
  public numberOfNews: number;
  public elementsArePresent = true;
  public tagList: string[];
  private destroy: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private ecoNewsService: EcoNewsService,
    private userOwnAuthService: UserOwnAuthService,
    private snackBar: MatSnackBarComponent,
    private localStorageService: LocalStorageService) { }

  ngOnInit() {
    this.onResize();
    this.setDefaultNumberOfNews(6);
    this.setNullList();
    this.checkUserSingIn();
    this.userOwnAuthService.getDataFromLocalStorage();
    this.scroll = false;
    this.setLocalizedTags();
  }

  private setLocalizedTags() {
    this.localStorageService.languageBehaviourSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.getAllTags());
  }

  private getAllTags() {
    this.ecoNewsService.getAllPresentTags()
      .pipe(take(1))
      .subscribe((tagsArray: Array<NewsTagInterface>) => this.tagList = tagsArray.map(tag => tag.name));
  }

  public onResize(): void {
    this.windowSize = window.innerWidth;
    this.view = (this.windowSize >= 576) ? this.view : true;
  }

  public onScroll(): void {
    this.scroll = true;
    this.addElemsToCurrentList();
  }

  public changeView(event: boolean): void {
    this.view = event;
  }

  public getFilterData(value: Array<string>): void {
    if (this.tagsList !== value) {
      this.setNullList();
      this.tagsList = value;
    }
    this.addElemsToCurrentList();
  }

  private checkUserSingIn(): void {
    this.userOwnAuthService.credentialDataSubject
      .subscribe((data) => this.isLoggedIn = data && data.userId);
  }

  private addElemsToCurrentList(): void {
    if (this.tagsList) {
      this.ecoNewsService.getNewsListByTags(this.currentPage, this.numberOfNews, this.tagsList)
        .pipe(
          takeUntil(this.destroy),
          catchError((error) => {
            this.snackBar.openSnackBar('error');

            return error;
          })
        )
        .subscribe((list: EcoNewsDto) => this.setList(list));
    } else {
      this.ecoNewsService.getEcoNewsListByPage(this.currentPage, this.numberOfNews)
        .pipe(
          takeUntil(this.destroy),
          catchError((error) => {
            this.snackBar.openSnackBar('error');

            return error;
          })
        )
        .subscribe((list: EcoNewsDto) => this.setList(list));
    }
    this.changeCurrentPage();
  }

  private setList(data: EcoNewsDto): void {
    this.remaining = data.totalElements;
    this.elements = this.scroll ? [...this.elements, ...data.page] : [...data.page];
    this.elementsArePresent = this.elements.length < data.totalElements;
  }

  private setNullList(): void {
    this.currentPage = 0;
    this.elements = [];
    this.elementsArePresent = true;
  }

  private setDefaultNumberOfNews(quantity: number): void {
    this.numberOfNews = quantity;
  }

  private changeCurrentPage(): void {
    this.currentPage += 1;
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
  }
}
