import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

	private url = '/api/user/register';
  constructor(private http : HttpClient) { }
	
	register(data: any) {
		console.log("Data: ",data);
		return this.http.post(this.url, data);
	}
	
	hello(data: any){
	console.log("D=t=: ",data);
	}
}
