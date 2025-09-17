import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolygonModalPage } from './polygon-modal.page';

describe('PolygonModalPage', () => {
  let component: PolygonModalPage;
  let fixture: ComponentFixture<PolygonModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PolygonModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
