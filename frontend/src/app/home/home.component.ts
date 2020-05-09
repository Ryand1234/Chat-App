import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	temp : any;
	msg : any;
	message : string;
	message_array : any = new Array();

	constructor(public chatService : ChatService) { 
	
		this.chatService.recieveMessage().subscribe((result)=>{
			console.log("RES: ",result);
			this.message_array.push(result);
		});

	}
	ngOnInit(): void {
		this.chatService.retrieveOldMessage().subscribe((result: any)=>
		{
			this.message_array = result;
			console.log("ARRAY: ",this.message_array);
		});
	}

	onSubmit(){
		this.chatService.sendMessage({message : this.message});
		this.message = '';
	}

}
