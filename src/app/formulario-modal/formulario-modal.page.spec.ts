import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioModalPage } from './formulario-modal.page';

describe('FormularioModalPage', () => {
  let component: FormularioModalPage;
  let fixture: ComponentFixture<FormularioModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
