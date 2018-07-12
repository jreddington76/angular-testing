import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class ExampleService {
  constructor(private http: HttpClient) { }

  getLookups(): Observable<any[]> {
    return this.http.get<Data[]>('api/example');
  }

  submit(payload) {
    this.http.post<any>('api/example', payload);
  }
}

export class Data {
  id: number;
  name: string;
}