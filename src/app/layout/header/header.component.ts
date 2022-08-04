
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { filter, Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AzureaddemoService } from 'src/app/azureaddemo.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit,OnDestroy  {
  
  isUserLoggedIn:boolean=false;
  private readonly _destroy=new Subject<void>();
  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig:MsalGuardConfiguration,
  private msalBroadCastService:MsalBroadcastService,
  private authservice:MsalService,private azureAddDemoService:AzureaddemoService)
  {

  }
  ngOnInit(): void {
    this.msalBroadCastService.inProgress$.pipe(
      filter((interactionStatus:InteractionStatus)=>
      interactionStatus==InteractionStatus.None),
      takeUntil(this._destroy))
      .subscribe(x=>
        {
          this.isUserLoggedIn=this.authservice.instance.getAllAccounts().length>0
          this.azureAddDemoService.isUserLoggedIn.next(this.isUserLoggedIn);
        })
  }
  ngOnDestroy(): void {
    this._destroy.next(undefined);
    this._destroy.complete();
  }
  login()
  {
    if(this.msalGuardConfig.authRequest)
    {
      this.authservice.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest);
    }
    else{
      this.authservice.loginRedirect();
    }
  }
  logout()
  {
    this.authservice.logoutRedirect({postLogoutRedirectUri:environment.postLogoutUrl});
  }
}

