import { Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { Router } from "@angular/router";
import { Alert } from "lib-core";
import AlertService = Alert.AlertService;

@Component( {
  selector: 'topic-mapping',
  standalone: true,
  imports: [],
  templateUrl: './topic-mapping.component.html',
  styleUrl: './topic-mapping.component.css'
} )
export class TopicMappingComponent {

  private manageBookSvc = inject( ManageBooksService );
  private alertSvc = inject( AlertService );
  private router = inject( Router );

  constructor() {

  }
}
