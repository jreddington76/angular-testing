import { Component, OnInit } from "@angular/core";
import { ExampleService } from "./example.service";

// NB use [ngValue] rather than [value] as this will retain the type used for value.  [value] will stringify
@Component({
  selector: 'app',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent implements OnInit {
  inputValue: string;
  selectedValue: boolean;
  options: any[];

  constructor(private service: ExampleService) { }

  ngOnInit(): void {
    this.service.getLookups()
      .forEach(
      data => {
        this.options = data;
      });
  }

  submitValue() {
    this.service.submit(this.inputValue);
  }
}