import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputErrorComponent } from './input-error.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';

describe('InputErrorComponent', () => {
  let component: InputErrorComponent;
  let fixture: ComponentFixture<InputErrorComponent>;

  const formElementMock = new FormControl('Text');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InputErrorComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputErrorComponent);
    component = fixture.componentInstance;
    component.formElement = formElementMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('method ngOnInit should call getType method', () => {
    const spy = spyOn(component, 'getType');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });
});
