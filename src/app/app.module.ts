import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BsModalService, ModalModule, PopoverModule, PopoverConfig, ButtonsModule } from 'ngx-bootstrap';
import { TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';
import { ArchwizardModule } from 'angular-archwizard';
import { Ng5SliderModule } from 'ng5-slider';
import { NumberPickerModule} from 'ng-number-picker';
import { UiSwitchModule } from 'ngx-ui-switch';
import { NgxUiLoaderModule, POSITION, NgxUiLoaderConfig, SPINNER, PB_DIRECTION } from 'ngx-ui-loader';
import { MathJaxModule } from 'ngx-mathjax';

import { AppComponent } from './app.component';
import { ZoomDirective } from './directives/zoom.directive';
import { NumberToArrayPipe } from './pipes/number-to-array.pipe';
import { ViewGraphComponent } from './components/view-graph/view-graph.component';
import { MoveAnimationDirective } from './directives/move-animation.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavPanelComponent } from './components/nav-panel/nav-panel.component';
import { MessageBoardComponent } from './components/message-board/message-board.component';
import { MessageBoardItemComponent } from './components/message-board-item/message-board-item.component';
import { ViewMainComponent } from './components/view-main/view-main.component';
import { MatrixComponent } from './components/matrix/matrix.component';
import { ViewMatrixComponent } from './components/view-matrix/view-matrix.component';
import { NavViewComponent } from './components/nav-view/nav-view.component';
import { ViewBaseComponent } from './components/view-base/view-base.component';
import { ConfigMainComponent } from './components/config-main/config-main.component';
import { ConfigNeuralNetworkComponent } from './components/config-neural-network/config-neural-network.component';
import { ViewGuard } from './guard/view-guard';
import { ConfigTrainingComponent } from './components/config-training/config-training.component';
import { ToastrModule } from 'ngx-toastr';
import { NumberInputComponent } from './components/number-input/number-input.component';
import { ConfigExecutionComponent } from './components/config-execution/config-execution.component';
import { PhaseModalComponent } from './components/phase-modal/phase-modal.component';
import { AppErrorHandler } from './handlers/app-error.handler';
import { DialogModalComponent } from './components/dialog-modal/dialog-modal.component';
import { ConfigPlaygroundComponent } from './components/config-playground/config-playground.component';
import { ConfigIntroComponent } from './components/config-intro/config-intro.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';

const routes: Routes = [
  { path: '', redirectTo: 'config', pathMatch: 'full' },
  { path: 'config', component: ConfigMainComponent },
  { path: 'view', component: ViewMainComponent, canActivate: [ViewGuard] },
  { path: '**', redirectTo: 'config' }
];

const toastrOptions = {
  positionClass: 'toast-bottom-right',
  maxOpened: 5,
  messageClass: 'notification',
};

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  bgsColor: '#fff',
  bgsOpacity: 1,
  bgsPosition: POSITION.centerCenter,
  bgsSize: 60,
  fgsColor: '#fff',
  fgsPosition: POSITION.centerCenter,
  fgsSize: 60,
  bgsType: SPINNER.threeStrings, // background spinner type
  fgsType: SPINNER.threeStrings, // foreground spinner type
  pbDirection: PB_DIRECTION.leftToRight, // progress bar direction
  pbThickness: 8, // progress bar thickness
  overlayColor: 'rgb(0,0,0,0)'
};


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    NavPanelComponent,
    NavViewComponent,
    ZoomDirective,
    NumberToArrayPipe,
    ConfigMainComponent,
    ConfigNeuralNetworkComponent,
    ConfigTrainingComponent,
    ConfigExecutionComponent,
    ViewBaseComponent,
    ViewMainComponent,
    ViewGraphComponent,
    ViewMatrixComponent,
    MoveAnimationDirective,
    MessageBoardComponent,
    MessageBoardItemComponent,
    MatrixComponent,
    NumberInputComponent,
    PhaseModalComponent,
    DialogModalComponent,
    ConfigPlaygroundComponent,
    ConfigIntroComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,

    ArchwizardModule,
    Ng5SliderModule,
    NumberPickerModule,
    UiSwitchModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot(toastrOptions),
    PopoverModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    ButtonsModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    MathJaxModule.forRoot({
      version: '2.7.5',
      config: 'TeX-AMS_HTML',
      hostname: 'cdnjs.cloudflare.com'
    })
  ],
  providers: [BsModalService,
              PopoverConfig,
              ViewGuard,
            //  { provide: ErrorHandler, useClass: AppErrorHandler }
            ],
  entryComponents: [ConfigTrainingComponent, ConfigExecutionComponent, PhaseModalComponent, DialogModalComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
