import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ActiveService {

	private url = '/api/user/active';
	constructor(public http : HttpClient) { }

	private httpOptionsPlain = {
  headers: new HttpHeaders({
    'Accept': 'text/plain',
    'Content-Type': 'text/plain'
  }),
  'responseType': 'text'
};
	active(){
		return this.http.get(this.url, this.httpOptionsPlain);
	}
}
