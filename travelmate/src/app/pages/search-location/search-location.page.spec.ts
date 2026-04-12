import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchLocationPage } from './search-location.page';

describe('SearchLocationPage', () => {
  let component: SearchLocationPage;
  let fixture: ComponentFixture<SearchLocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
