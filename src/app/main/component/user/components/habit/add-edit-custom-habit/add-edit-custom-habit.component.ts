import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import Quill from 'quill';
import 'quill-emoji/dist/quill-emoji.js';
import { quillConfig } from './quillEditorFunc';
import ImageResize from 'quill-image-resize-module';
import { ShoppingList } from '@global-user/models/shoppinglist.model';
import { HabitService } from '@global-service/habit/habit.service';
import { TagInterface } from '@shared/components/tag-filter/tag-filter.model';
import { LanguageService } from 'src/app/main/i18n/language.service';
import { CustomHabitInterface } from 'src/app/main/interface/habit/custom-habit.interface';

@Component({
  selector: 'app-add-edit-custom-habit',
  templateUrl: './add-edit-custom-habit.component.html',
  styleUrls: ['./add-edit-custom-habit.component.scss']
})
export class AddEditCustomHabitComponent implements OnInit {
  public habitForm: FormGroup;
  public habit: any;
  public complexityList = [
    { value: 1, name: 'user.habit.add-new-habit.difficulty.easy' },
    { value: 2, name: 'user.habit.add-new-habit.difficulty.medium' },
    { value: 3, name: 'user.habit.add-new-habit.difficulty.hard' }
  ];
  public lineStar = 'assets/img/icon/star-2.png';
  public greenStar = 'assets/img/icon/star-1.png';
  public initialDuration = 7;
  public shopList: ShoppingList[] = [];
  public newList: ShoppingList[] = [];
  public tagsList: TagInterface[];
  public selectedTagsList: string[];

  public quillModules = {};
  public isEditing = false;
  private userId: number;
  private currentLang: string;

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private habitService: HabitService,
    private langService: LanguageService
  ) {
    this.quillModules = quillConfig;
    Quill.register('modules/imageResize', ImageResize);
  }

  ngOnInit(): void {
    this.getUserId();
    this.initForm();
    this.getHabitTags();
    this.subscribeToLangChange();
  }

  private getUserId() {
    this.userId = this.localStorageService.getUserId();
  }

  private initForm(): void {
    this.habitForm = this.fb.group({
      title: new FormControl('', [Validators.required, Validators.maxLength(70)]),
      description: new FormControl('', [Validators.required, Validators.minLength(20), Validators.maxLength(63206)]),
      complexity: new FormControl(1, [Validators.required, Validators.max(3)]),
      duration: new FormControl(null, [Validators.required, Validators.min(7), Validators.max(56)]),
      tags: new FormControl(null, Validators.required),
      shopList: new FormControl([])
    });
  }

  public getControl(control: string): AbstractControl {
    return this.habitForm.get(control);
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageBehaviourSubject.pipe(takeUntil(this.destroyed$)).subscribe((lang) => {
      this.translate.setDefaultLang(lang);
      this.currentLang = lang;
    });
  }

  public getStars(value: number, complexity: number): string {
    return value <= complexity ? this.greenStar : this.lineStar;
  }

  public getDuration(newDuration: number): void {
    this.getControl('duration').setValue(newDuration);
  }

  public getShopList(list: ShoppingList[]): void {
    this.newList = list.map((item) => {
      return {
        id: item.id,
        status: item.status,
        text: item.text
      };
    });
    this.getControl('shopList').setValue(this.newList);
  }

  public getTagsList(list: TagInterface[]): void {
    this.selectedTagsList = list.map((el) => this.getLangValue(el.nameUa, el.name));
    this.getControl('tags').setValue(this.selectedTagsList);
  }

  public goToAllHabits(): void {
    this.router.navigate([`/profile/${this.userId}/allhabits`]);
  }

  private getHabitTags(): void {
    this.habitService
      .getAllTags()
      .pipe(take(1))
      .subscribe((tags: TagInterface[]) => {
        this.tagsList = tags;
        this.tagsList.forEach((item) => (item.isActive = false));
      });
  }

  private getLangValue(valUa: string, valEn: string): string {
    return this.langService.getLangValue(valUa, valEn) as string;
  }

  public addHabit(): void {
    console.log(this.habitForm.value);
    // this.habitService.addCustomHabit(this.habitForm.value, this.currentLang).pipe(take(1)).subscribe((res) => {
    //   console.log(res);
    // });
  }
}
