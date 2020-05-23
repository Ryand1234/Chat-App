import { Component, OnInit } from '@angular/core';
import { RoomService } from './room.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	temp : any;
	msg : any;
	room : string;
	//room_array : any = new Array();

	// Test Array
	room_array : any = [
		{
			name : "PubG Room"
		},
		{
			name : "Fortnite Room"
		},
		{
			name : "GTA V Room"
		}
	];
	constructor(public roomService : RoomService,
		public router : Router) { }
	ngOnInit(): void {
		this.roomService.retrieveRooms().subscribe((result: any)=>
		{
			console.log("RES: ",result);
			this.room_array = result;
			console.log("ARRAY: ",this.room_array);
		});
	}

	_id : string;
	find(name: string){

		for(let room of this.room_array){
			if(room.name == name){
				this._id = room._id;
				break;
			}
		}
		return this._id;
			
	}


	token: string;
	onSubmit(){
		this.token = this.find(this.room);
		this.roomService.join(this.token).subscribe((result:any)=>{
		this.router.navigate(['/chat']);
		});
	}

}
