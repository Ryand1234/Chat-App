import { Component, OnInit } from '@angular/core';
import { CreateService } from './create.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent {

	room_name: string;
	constructor(private service : CreateService,
		private router : Router) { }

	data: any = new Object();
	error: any;
	onSubmit(){
		this.data.name = this.room_name;
		console.log("Data: ",this.data);
		this.service.createRoom(this.data).subscribe((result)=>{
			this.router.navigate(['/room']);
		}, (err)=>{
			this.error = err;
		});
	}
}
