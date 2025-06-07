import { Component, inject } from '@angular/core';
import { StateService } from "../../service/state.service";
import { UIHelperService } from "../../service/ui-helper.service";
import { DatePipe, DecimalPipe, NgClass } from "@angular/common";
import { SConsoleUtil } from "@jee-common/util/common-util";

@Component({
  selector: 'study-events-screen',
  imports: [
    DatePipe,
    DecimalPipe,
    NgClass
  ],
  templateUrl: './session-events-screen.component.html',
  styleUrl: './session-events-screen.component.css'
})
export class SessionEventsScreenComponent {

  stateSvc: StateService = inject( StateService ) ;
  uiSvc: UIHelperService = inject( UIHelperService ) ;

  protected readonly SConsoleUtil = SConsoleUtil;
}
