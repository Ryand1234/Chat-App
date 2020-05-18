import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, NgForm } from '@angular/forms';
import { RegisterService } from './register.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

	user = new FormGroup({
	name : new FormControl(''),
	username : new FormControl(''),
	email : new FormControl(''),
	passwd : new FormControl(''),
	mobile : new FormControl('')
	});
  constructor(private service : RegisterService) { }

	msg: any;
  onSubmit() {

	var userinfo = {
		username: this.user.value.username,
		name: this.user.value.name,
		email: this.user.value.email,
		passwd: this.user.value.passwd,
		mobile: this.user.value.mobile
	};

	console.log("SER: ",userinfo);
	//var result = this.http.post('/api/user/register',data);
	this.service.register(userinfo).subscribe((result)=>{
	this.msg = result;
	});
	console.log("Done");
  }
}
