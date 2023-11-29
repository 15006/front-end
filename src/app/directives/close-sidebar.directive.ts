import { Directive, HostListener } from '@angular/core';
import { UiStateService } from '../core/services/ui-state.service';

@Directive({
  selector: '[appCloseSidebar]'
})
export class CloseSidebarDirective {

  @HostListener('click')
  onClick() {
    this.uiState.closeSidebar();
  }


  constructor(private uiState: UiStateService) { }

}
