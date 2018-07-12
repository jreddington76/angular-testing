import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Data } from './example.service';

describe('HttpClient testing', () => {
  const testUrl = "api/example";
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    // Inject the http service and test controller for each test
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });


  it('should allow get request', () => {
    const testData: Data = { id: 1, name: 'Test Data' };

    // Make an HTTP GET request
    httpClient.get<Data>(testUrl)
      .subscribe(data =>
        // When observable resolves, result should match test data
        expect(data).toEqual(testData)
      );

    // The following `expectOne()` will match the request's URL.
    // If no requests or multiple requests matched that URL
    // `expectOne()` would throw.
    const req = httpTestingController.expectOne(testUrl);

    // Assert that the request is a GET.
    expect(req.request.method).toEqual('GET');

    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    req.flush(testData);
  });

  it('should allow multiple get requests', () => {
    const testData: Data[] = [{ id: 1, name: 'Test Data' }];

    // Make an HTTP GET request
    httpClient.get<Data>(testUrl)
      .subscribe(data =>
        // When observable resolves, result should match test data
        expect(data).toEqual([])
      );

    // Make another HTTP GET request
    httpClient.get<Data>(testUrl)
      .subscribe(data =>
        // When observable resolves, result should match test data
        expect(data).toEqual([testData[0]])
      );

    // returns array of matching requests
    const requests = httpTestingController.match(testUrl);
    expect(requests.length).toEqual(2);

    requests[0].flush([]);
    requests[1].flush([testData[0]]);
  });

  // test for header
  it('should send authorization header', () => {
    const testData: Data = { id: 1, name: 'Test Data' };

    // add headers
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'my-auth-token'
      })
    };

    // Make an HTTP GET request
    httpClient.get<Data>(testUrl, httpOptions)
      .subscribe(data =>
        // When observable resolves, result should match test data
        expect(data).toEqual(testData)
      );

    // Expect one request with an authorization header
    const req = httpTestingController.expectOne(
      req => req.headers.has('Authorization')
    );

    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    req.flush(testData);
  });

  it('should handle network error', () => {
    const emsg = 'simulated network error';

    httpClient.get<Data[]>(testUrl)
      .subscribe(
      data => fail('should have failed with the network error'),
      (error: HttpErrorResponse) => {
        expect(error.error.message).toEqual(emsg, 'message');
      });

    const req = httpTestingController.expectOne(testUrl);

    // Create mock ErrorEvent, raised when something goes wrong at the network level.
    // Connection timeout, DNS error, offline, etc
    const mockError = new ErrorEvent('Network error', {
      message: emsg,
    });

    // Respond with mock error
    req.error(mockError);
  });
});