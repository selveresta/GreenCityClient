import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Place } from '../../component/places/models/place';
import { PlaceInfo } from '../../model/place/place-info';
import { UpdatePlaceStatus } from '../../model/place/update-place-status.model';
import { PlacePageableDto } from '../../model/place/place-pageable-dto.model';
import { mainLink, placeLink } from '../../links';
import { PlaceAddDto } from '../../model/placeAddDto.model';
import { FilterPlaceService } from '../filtering/filter-place.service';
import { FilterPlaceDtoModel } from '../../model/filtering/filter-place-dto.model';
import { AdminPlace } from '../../component/admin/models/admin-place.model';
import { BulkUpdatePlaceStatus } from '../../model/place/bulk-update-place-status.model';
import { PlaceUpdatedDto } from '../../component/admin/models/placeUpdatedDto.model';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  places: Place[];
  showHours = false;
  private baseUrl = `${mainLink}place/`;
  private placeStatus: UpdatePlaceStatus;
  private bulkUpdateStatus: BulkUpdatePlaceStatus;
  private ids: any;

  constructor(private http: HttpClient, private filterService: FilterPlaceService) {}

  getFilteredPlaces() {
    const filterDto = this.filterService.getFilters();
    this.http.post<Place[]>(`${placeLink}filter`, filterDto).subscribe((res) => (this.places = res));
  }

  save(place: PlaceAddDto) {
    this.http.post(`${placeLink}propose`, place);
  }

  getPlaceInfo(id: number): Observable<PlaceInfo> {
    return this.http.get<PlaceInfo>(`${placeLink}info/${id}`);
  }

  getFavoritePlaceInfo(id: number): Observable<PlaceInfo> {
    return this.http.get<PlaceInfo>(`${placeLink}info/favorite/${id}`);
  }

  getPlacesByStatus(status: string, paginationSettings: string): Observable<PlacePageableDto> {
    return this.http.get<PlacePageableDto>(`${placeLink}${status}` + paginationSettings);
  }

  updatePlaceStatus(id: number, status: string): Observable<UpdatePlaceStatus> {
    this.placeStatus = new UpdatePlaceStatus();
    this.placeStatus.id = id;
    this.placeStatus.status = status;

    return this.http.patch<UpdatePlaceStatus>(`${placeLink}status`, this.placeStatus);
  }

  bulkUpdatePlaceStatuses(places: AdminPlace[], status: string): Observable<UpdatePlaceStatus[]> {
    this.bulkUpdateStatus = new BulkUpdatePlaceStatus();
    this.bulkUpdateStatus.ids = [];
    this.bulkUpdateStatus.status = status;

    places.forEach((item) => {
      this.bulkUpdateStatus.ids.push(item.id);
    });

    return this.http.patch<UpdatePlaceStatus[]>(`${placeLink}statuses`, this.bulkUpdateStatus);
  }

  delete(id: number): Observable<number> {
    return this.http.delete<number>(`${placeLink}` + id);
  }

  bulkDelete(places: AdminPlace[]): Observable<number> {
    this.ids = '';

    places.forEach((item) => {
      this.ids += item.id + ',';
    });

    return this.http.delete<number>(`${placeLink}?ids=${this.ids}`);
  }

  getStatuses(): Observable<string[]> {
    return this.http.get<string[]>(`${placeLink}statuses`);
  }

  filterByRegex(paginationSettings: string, filterDto: FilterPlaceDtoModel): Observable<PlacePageableDto> {
    if (filterDto.searchReg === undefined) {
      filterDto.searchReg = '%%';
      // tslint:disable-next-line:max-line-length
      return this.http.post<PlacePageableDto>(
        `${this.baseUrl}filter/predicate` + paginationSettings + `&sort=modifiedDate,desc`,
        filterDto
      );
    } else {
      // tslint:disable-next-line:max-line-length
      return this.http.post<PlacePageableDto>(
        `${this.baseUrl}filter/predicate` + paginationSettings + `&sort=modifiedDate,desc`,
        filterDto
      );
    }
  }

  getPlaceByID(id: number): Observable<PlaceUpdatedDto> {
    return this.http.get<PlaceUpdatedDto>(`${placeLink}about/${id}`);
  }

  updatePlace(updatedPlace: PlaceUpdatedDto) {
    return this.http.put<PlaceUpdatedDto>(`${placeLink}update`, updatedPlace);
  }
}
