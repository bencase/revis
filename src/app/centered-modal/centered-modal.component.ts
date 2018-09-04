import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'centered-modal',
  templateUrl: './centered-modal.component.html',
  styleUrls: ['./centered-modal.component.scss']
})
export class CenteredModalComponent implements OnInit {

	@Input() title: string;
	@Input() close: () => void = function(){console.log("default close function called")};

	constructor() { }

	ngOnInit() {
	}

}
