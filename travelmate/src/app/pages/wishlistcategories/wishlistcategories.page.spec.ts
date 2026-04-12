import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WishlistcategoriesPage } from './wishlistcategories.page';

describe('WishlistcategoriesPage', () => {
  let component: WishlistcategoriesPage;
  let fixture: ComponentFixture<WishlistcategoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WishlistcategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
