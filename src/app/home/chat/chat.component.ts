import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

	temp : any;
        msg : any;
        message : string;
        message_array : any = new Array();

        constructor(public chatService : ChatService) {

                this.chatService.recieveMessage().subscribe((result)=>{
 //                       console.log("RES: ",result);
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

	ngOnDestroy() {
		this.chatService.leave();
	}

        onSubmit(){
                this.chatService.sendMessage({message : this.message});
                this.message = '';
        }

}
