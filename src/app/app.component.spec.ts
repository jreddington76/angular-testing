import { ComponentFixture, async, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core/src/debug/debug_node";
import { of } from "rxjs";

import { AppComponent } from "./app.component";
import { ExampleService } from "./example.service";


let getLookupsSpy;
let submitSpy;

fdescribe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    const testLookups = [{ key: true, value: "True" }, { key: false, value: "False" }];

    const exampleService = jasmine.createSpyObj('ExampleService', ['getLookups', 'submit']);
    getLookupsSpy = exampleService.getLookups.and.returnValue(of(testLookups));
    submitSpy = exampleService.submit;

    TestBed.configureTestingModule({
      imports: [
        FormsModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: ExampleService, useValue: exampleService }
      ]
    })
      .compileComponents().then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
      });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  // test that input has rendered
  it('should render input', () => {
    const input: DebugElement = fixture.debugElement.query(By.css('input'));

    expect(input).toBeDefined();
  });

  // test that input has specific attribute
  it('should have input with placeholder', () => {
    const input: HTMLElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(input.attributes.getNamedItem('placeholder').value).toEqual('Enter text');
  });

  // test that user input is bound to model
  it('should set model when input changed', fakeAsync(() => {
    fixture.detectChanges();
    expect(component.inputValue).toBeFalsy();

    const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'user input';
    input.dispatchEvent(new Event('input'));

    expect(component.inputValue).toBe('user input');
  }));

  // test that button has rendered
  it('should render button', () => {
    const button: DebugElement = fixture.debugElement.query(By.css('button'));

    expect(button).toBeDefined();
  });

  // test that button is initially disabled
  it('should initially disable search button', () => {
    fixture.detectChanges();  // need to call this to initialize component variables

    const button: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(button.disabled).toBeTruthy();
  });

  // test that button is enabled when user inputs value
  it('should enable search button when user inputs data', () => {
    component.inputValue = "some value";

    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(button.disabled).toBeFalsy();
  });

  // test that button is disabled when user clears input
  it('should disable search button when user clears input', () => {
    component.inputValue = "some value";
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.disabled).toBeFalsy();

    delete component.inputValue;
    fixture.detectChanges();

    expect(button.disabled).toBeTruthy();
  });

  // test that the lookups are obtained from the service - a spy in this case
  it('should get lookups from service', () => {
    fixture.detectChanges();  // oninit()

    expect(getLookupsSpy.calls.any()).toBe(true, 'getLookups called');

    expect(component.options.length).toBe(2);
    expect(component.options[0]).toEqual({ key: true, value: "True" });
    expect(component.options[1]).toEqual({ key: false, value: "False" });
  });

  // test that the lookups are bound to select
  it('should populate select with lookups', () => {
    fixture.detectChanges();  // oninit()
    const select = fixture.debugElement.query(By.css('select')).nativeElement;

    expect(select.options.length).toBe(3);
    expect(select.options[0].value).toBe('None');
    expect(select.options[1].value).toBe('1: true');  // note the strange syntax
    expect(select.options[1].text).toBe('True');
    expect(select.options[2].value).toBe('2: false');
    expect(select.options[2].text).toBe('False');
  });

  // test that the selected value is bound to model
  it('should update model with user selection', () => {
    fixture.detectChanges();  // oninit()
    const select = fixture.debugElement.query(By.css('select')).nativeElement;
    select.value = select.options[1].value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    
    expect(component.selectedValue).toBe(true);
  });

  // test that service is called when button clicked
  it('should call service with user input', () => {
    component.inputValue = "some value";
    fixture.detectChanges();

    const button: DebugElement = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);

    expect(submitSpy).toHaveBeenCalledWith("some value");
  });
});