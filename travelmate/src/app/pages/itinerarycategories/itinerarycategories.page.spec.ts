import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItinerarycategoriesPage } from './itinerarycategories.page';

describe('ItinerarycategoriesPage', () => {
  let component: ItinerarycategoriesPage;
  let fixture: ComponentFixture<ItinerarycategoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ItinerarycategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
