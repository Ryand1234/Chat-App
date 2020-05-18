import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ActiveService {

	private url = '/api/user/active';
	constructor(public http : HttpClient) { }

	httpOptions = new HttpHeaders({'Content-Type':'application/json; charset=utf-8'});
	active(){
		return this.http.get(this.url, { headers: this.httpOptions, responseType: 'json'});
	}
}
