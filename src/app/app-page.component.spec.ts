import { ComponentFixture, async, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core/src/debug/debug_node";
import { of } from "rxjs";

import { AppComponent } from "./app.component";
import { ExampleService } from "./example.service";


fdescribe('AppComponentPage', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let page: Page;

  beforeEach(async(() => {
    const exampleService = jasmine.createSpyObj('ExampleService', ['getLookups', 'submit']);

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
        page = new Page(fixture);
      });
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  // test that input has rendered
  it('should render input', () => {
    expect(page.input).toBeDefined();
  });

  // test that input has specific attribute
  it('should have input with placeholder', () => {
    expect(page.input.attributes.getNamedItem('placeholder').value).toEqual('Enter text');
  });

  // test that user input is bound to model
  it('should set model when input changed', fakeAsync(() => {
    fixture.detectChanges();
    expect(component.inputValue).toBeFalsy();

    page.input.value = 'user input';
    page.input.dispatchEvent(new Event('input'));

    expect(component.inputValue).toBe('user input');
  }));

  // test that button has rendered
  it('should render button', () => {
    expect(page.button).toBeDefined();
  });

  // test that button is initially disabled
  it('should initially disable search button', () => {
    fixture.detectChanges();  // need to call this to initialize component variables

    expect(page.button.disabled).toBeTruthy();
  });

  // test that button is enabled when user inputs value
  it('should enable search button when user inputs data', () => {
    component.inputValue = "some value";
    fixture.detectChanges();

    expect(page.button.disabled).toBeFalsy();
  });

  // test that button is disabled when user clears input
  it('should disable search button when user clears input', () => {
    component.inputValue = "some value";
    fixture.detectChanges();

    expect(page.button.disabled).toBeFalsy();

    delete component.inputValue;
    fixture.detectChanges();

    expect(page.button.disabled).toBeTruthy();
  });

  // test that the lookups are obtained from the service - a spy in this case
  it('should get lookups from service', () => {
    fixture.detectChanges();  // oninit()

    expect(page.getLookupsSpy.calls.any()).toBe(true, 'getLookups called');

    expect(component.options.length).toBe(2);
    expect(component.options[0]).toEqual({ key: true, value: "True" });
    expect(component.options[1]).toEqual({ key: false, value: "False" });
  });

  // test that the lookups are bound to select
  it('should populate select with lookups', () => {
    fixture.detectChanges();  // oninit()

    expect(page.select.options.length).toBe(3);
    expect(page.select.options[0].value).toBe('None');
    expect(page.select.options[1].value).toBe('1: true');  // note the strange syntax
    expect(page.select.options[1].text).toBe('True');
    expect(page.select.options[2].value).toBe('2: false');
    expect(page.select.options[2].text).toBe('False');
  });

  // test that the selected value is bound to model
  it('should update model with user selection', () => {
    fixture.detectChanges();  // oninit()

    page.select.value = page.select.options[1].value;
    page.select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.selectedValue).toBe(true);
  });

  // test that service is called when button clicked
  it('should call service with user input', () => {
    component.inputValue = "some value";
    fixture.detectChanges();

    // need the debugElement here so we can trigger event handler
    const button: DebugElement = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);

    expect(page.submitSpy).toHaveBeenCalledWith("some value");
  });
});


class Page {
  // getter properties wait to query the DOM until called.
  get input() { return this.query<HTMLInputElement>('input'); }
  get select() { return this.query<HTMLSelectElement>('select'); }
  get button() { return this.query<HTMLButtonElement>('button'); }

  testLookups = [{ key: true, value: "True" }, { key: false, value: "False" }];
  getLookupsSpy: jasmine.Spy;
  submitSpy: jasmine.Spy;

  constructor(private fixture: ComponentFixture<AppComponent>) {
    // get the navigate spy from the injected router spy object
    const serviceSpy = <any>fixture.debugElement.injector.get(ExampleService);
    this.getLookupsSpy = serviceSpy.getLookups.and.returnValue(of(this.testLookups));
    this.submitSpy = serviceSpy.submit;

    // spy on component's `gotoList()` method
    //const component = fixture.componentInstance;
    //this.gotoListSpy = spyOn(component, 'gotoList').and.callThrough();
  }

  //// query helpers ////
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }

  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}