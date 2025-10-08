import { filter } from 'rxjs';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import * as XLSX from 'xlsx';
import { saveAs} from 'file-saver';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SaisonService } from '../../../service/saison.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { StadeService } from '../../../service/stade.service';
import { Stadium } from '../../../models/stadium.model';
import { Checkbox } from "primeng/checkbox";
import { MatchService } from '../../../service/match.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { EquipeService } from '../../../service/equipe.service';
import { Team } from '../../../models/team.model';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MatchDayService } from '../../../service/match-day.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { PdfGeneratorService } from '../../../service/pdf-generator.service';

interface Match {
  number: number;
  team1: string;
  team2: string;
  stadium: string;
  date: string;
  time: string;
}

interface Matchday {
  groupedMatchesByDate?: any[];
  label: string;
  matches: Match[];
  start_date?: string;
  end_date?: string;
  match_day_id?: string;

}

interface Phase {
  name: string;
  start: string;
  end: string;
  matchdays: Matchday[];
}

@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [CommonModule, CarouselModule, TabViewModule, TabsModule, ButtonModule, RouterModule, ProgressSpinnerModule, DialogModule, SelectModule, ReactiveFormsModule, FormsModule, DatePickerModule, Checkbox, ToastModule, TooltipModule, ConfirmDialogModule,
    MultiSelectModule, CardModule, InputNumberModule
  ],
  templateUrl: './calendrier.component.html',
  styleUrls: ['./calendrier.component.scss']
})
export class CalendrierComponent implements OnInit {

    seasonId: string = '';
    loading: boolean=false
  /*   @ViewChild('calendarExport') componentToExportRef!: ElementRef; */

/*     phases: Phase[] = [
  {
    name: 'Phase Aller',
    start: '2025-08-12',
    end: '2025-10-15',
    matchdays: [
      {
        label: '1ère Journée',
        matches: [
          { team1: 'AS SONABEL', team2: 'SALITAS', stadium: 'Stade municipal Ouaga', date: '2025-08-12', time: '15:30' },
          { team1: 'RCK', team2: 'MAJESTIC', stadium: 'Stade du 4 août Ouaga', date: '2025-08-12', time: '18:00' },
          { team1: 'EFO', team2: 'USFA', stadium: 'Stade Wobi Bobo', date: '2025-08-13', time: '15:30' },
          { team1: 'KOZAF', team2: 'USO', stadium: 'Stade municipal Ouaga', date: '2025-08-13', time: '18:00' }
        ]
      },
      {
        label: '2e Journée',
        matches: [
          { team1: 'SALITAS', team2: 'RCK', stadium: 'Stade municipal Ouaga', date: '2025-08-19', time: '15:30' },
          { team1: 'AS SONABEL', team2: 'KOZAF', stadium: 'Stade du 4 août Ouaga', date: '2025-08-20', time: '16:00' },
          { team1: 'USO', team2: 'EFO', stadium: 'Stade Wobi Bobo', date: '2025-08-20', time: '18:30' },
          { team1: 'MAJESTIC', team2: 'USFA', stadium: 'Stade municipal Ouaga', date: '2025-08-21', time: '15:30' }
        ]
      },
      {
        label: '3e Journée',
        matches: [
          { team1: 'AS SONABEL', team2: 'EFO', stadium: 'Stade municipal Ouaga', date: '2025-08-26', time: '15:30' },
          { team1: 'RCK', team2: 'USO', stadium: 'Stade du 4 août Ouaga', date: '2025-08-27', time: '16:00' },
          { team1: 'USFA', team2: 'SALITAS', stadium: 'Stade Wobi Bobo', date: '2025-08-27', time: '18:00' },
          { team1: 'MAJESTIC', team2: 'KOZAF', stadium: 'Stade municipal Ouaga', date: '2025-08-28', time: '15:30' }
        ]
      },
      {
        label: '4e Journée',
        matches: [
          { team1: 'USFA', team2: 'AS SONABEL', stadium: 'Stade municipal Ouaga', date: '2025-09-01', time: '15:30' },
          { team1: 'SALITAS', team2: 'KOZAF', stadium: 'Stade Wobi Bobo', date: '2025-09-01', time: '17:30' },
          { team1: 'EFO', team2: 'MAJESTIC', stadium: 'Stade du 4 août Ouaga', date: '2025-09-02', time: '15:30' },
          { team1: 'USO', team2: 'RCK', stadium: 'Stade municipal Ouaga', date: '2025-09-03', time: '18:00' }
        ]
      },
      {
        label: '5e Journée',
        matches: [
          { team1: 'KOZAF', team2: 'AS SONABEL', stadium: 'Stade municipal Ouaga', date: '2025-09-08', time: '15:30' },
          { team1: 'USO', team2: 'SALITAS', stadium: 'Stade Wobi Bobo', date: '2025-09-08', time: '18:30' },
          { team1: 'EFO', team2: 'RCK', stadium: 'Stade du 4 août Ouaga', date: '2025-09-09', time: '15:30' },
          { team1: 'MAJESTIC', team2: 'USFA', stadium: 'Stade municipal Ouaga', date: '2025-09-10', time: '17:00' }
        ]
      }
    ]
  },
  {
    name: 'Phase Retour',
    start: '2026-01-10',
    end: '2026-03-30',
    matchdays: [
      {
        label: '6e Journée',
        matches: [
          { team1: 'SALITAS', team2: 'AS SONABEL', stadium: 'Stade municipal Ouaga', date: '2026-01-10', time: '15:30' },
          { team1: 'MAJESTIC', team2: 'RCK', stadium: 'Stade du 4 août Ouaga', date: '2026-01-10', time: '18:00' },
          { team1: 'USFA', team2: 'EFO', stadium: 'Stade Wobi Bobo', date: '2026-01-11', time: '15:30' },
          { team1: 'USO', team2: 'KOZAF', stadium: 'Stade municipal Ouaga', date: '2026-01-11', time: '18:00' }
        ]
      },
      {
        label: '7e Journée',
        matches: [
          { team1: 'RCK', team2: 'SALITAS', stadium: 'Stade municipal Ouaga', date: '2026-01-17', time: '15:30' },
          { team1: 'KOZAF', team2: 'AS SONABEL', stadium: 'Stade du 4 août Ouaga', date: '2026-01-18', time: '16:00' },
          { team1: 'EFO', team2: 'USO', stadium: 'Stade Wobi Bobo', date: '2026-01-18', time: '18:30' },
          { team1: 'USFA', team2: 'MAJESTIC', stadium: 'Stade municipal Ouaga', date: '2026-01-19', time: '15:30' }
        ]
      },
      {
        label: '8e Journée',
        matches: [
          { team1: 'EFO', team2: 'AS SONABEL', stadium: 'Stade municipal Ouaga', date: '2026-01-24', time: '15:30' },
          { team1: 'USO', team2: 'RCK', stadium: 'Stade du 4 août Ouaga', date: '2026-01-25', time: '16:00' },
          { team1: 'SALITAS', team2: 'USFA', stadium: 'Stade Wobi Bobo', date: '2026-01-25', time: '18:00' },
          { team1: 'KOZAF', team2: 'MAJESTIC', stadium: 'Stade municipal Ouaga', date: '2026-01-26', time: '15:30' }
        ]
      },
      {
        label: '9e Journée',
        matches: [
          { team1: 'AS SONABEL', team2: 'USFA', stadium: 'Stade municipal Ouaga', date: '2026-02-01', time: '15:30' },
          { team1: 'KOZAF', team2: 'SALITAS', stadium: 'Stade Wobi Bobo', date: '2026-02-01', time: '17:30' },
          { team1: 'MAJESTIC', team2: 'EFO', stadium: 'Stade du 4 août Ouaga', date: '2026-02-02', time: '15:30' },
          { team1: 'RCK', team2: 'USO', stadium: 'Stade municipal Ouaga', date: '2026-02-03', time: '18:00' }
        ]
      },
      {
        label: '10e Journée',
        matches: [
          { team1: 'AS SONABEL', team2: 'KOZAF', stadium: 'Stade municipal Ouaga', date: '2026-02-08', time: '15:30' },
          { team1: 'SALITAS', team2: 'USO', stadium: 'Stade Wobi Bobo', date: '2026-02-08', time: '18:30' },
          { team1: 'RCK', team2: 'EFO', stadium: 'Stade du 4 août Ouaga', date: '2026-02-09', time: '15:30' },
          { team1: 'USFA', team2: 'MAJESTIC', stadium: 'Stade municipal Ouaga', date: '2026-02-10', time: '17:00' }
        ]
      }
    ]
  }
]; */
    phases: Phase[] = []
    selectedPhaseIndex = 0;
    exportingPdf: boolean = false;
    groupId?: string = '';
    poolName?: string = '';
    leagueName?: string = '';
    leagueLogo?: string = '';
    startDate?: string = '';
    endDate?: string = '';

 displayRescheduleDialog: boolean = false;
 displayFormSelectDialog: boolean = false;
 displayMatchDayRescheduleDialog: boolean = false;
 displayMatchDayReplaceDialog: boolean = false;
 formSelectChoices=[
  {name:'Remplacer la journée',value:'replace'},
  {name:'Modifier la période de la journée',value:'reschedule'},
 ]
  selectedMatch: any;
  matchdaysOptions: any[] = [];
  newMatchDate: Date | null = null;
  newMatchDateControl = new FormControl(new Date());
  stadiums: Stadium[] = [];
  newMatchStadiumControl = new FormControl('',[Validators.required]);
  newMatchDayControl = new FormControl('',[Validators.required]);
  isDerbyControl = new FormControl(false,[Validators.required]);
  formLoading: boolean=false;
  selectedMatchDay?: Matchday;
  newMatchTimeControl=new FormControl(new Date(),[Validators.required]);
  newTeam1Control = new FormControl('',[Validators.required]);
  newTeam2Control = new FormControl('',[Validators.required]);
  teams:Team[]=[];
  matchDayToReplaceControl = new FormControl('',[Validators.required]);
  matchDayStartControl = new FormControl(new Date(),[Validators.required]);
  matchDayEndControl = new FormControl(new Date(),[Validators.required]);
  formSelectControl = new FormControl('',[Validators.required]);

  swappableMatchDays:Matchday[]=[]
  displayGenerateDialog: boolean = false;
  generateForm!: FormGroup
  skipDateControl = new FormControl<Date | null>(null);
    allowedDaysOptions = [
    { label: 'Lundi', value: 'Monday' },
    { label: 'Mardi', value: 'Tuesday' },
    { label: 'Mercredi', value: 'Wednesday' },
    { label: 'Jeudi', value: 'Thursday' },
    { label: 'Vendredi', value: 'Friday' },
    { label: 'Samedi', value: 'Saturday' },
    { label: 'Dimanche', value: 'Sunday' }
    ];

    second_leg_is_enabled:boolean=false


    constructor(private route: ActivatedRoute, private router: Router, private saisonService: SaisonService, private pdfGeneratorService: PdfGeneratorService, private stadeService:StadeService,
        private matchService: MatchService, private messageService:MessageService, private equipeService:EquipeService,
        private confirmationService: ConfirmationService, private matchDayService:MatchDayService, private fb:FormBuilder
    ) {
        this.newMatchDayControl.valueChanges.subscribe((value) => {
            this.selectedMatchDay=this.phases[this.selectedPhaseIndex].matchdays.find((matchday) =>matchday.match_day_id === value)
        console.log(this.selectedMatchDay);
        this.newMatchDateControl.setValidators([Validators.required,this.dateRangeValidator(new Date(this.selectedMatchDay?.start_date!),new Date(this.selectedMatchDay?.end_date!),)]);
        this.newMatchDateControl.updateValueAndValidity();
        })

        this.initGenerateForm();

    }
    ngOnInit(): void {
        // get seasonId and poolId from params
    this.route.queryParamMap.subscribe(params => {
      this.groupId = params.get('groupId') || '';
      this.seasonId = params.get('seasonId') || '';
        console.log(this.groupId);

        this.getCalendar();
        this.loadStadiums();
        this.loadTeams();

    });




    // Initialize the selected season ID from the URL





    }


       getSeasonId(){
        this.loading = true;

    this.route.paramMap.subscribe(params => {
       this.seasonId= params.get('seasonId') || '';

    });

    }

    getCalendar(){
          if(!this.groupId)
    this.saisonService.get(this.seasonId).subscribe({

      next: (res: any) => {
        let calendar= res?.data?.calendar;

        this.leagueName=res?.data?.name
        this.leagueLogo=res?.data?.logo
        this.startDate=res?.data?.start_date
        this.endDate=res?.data?.end_date
        this.phases=[]
        this.phases.push(calendar?.first_leg)
        this.phases.push(calendar?.second_led);
        /* this.phases = res?.data?.calendar || []; */
        let numeroMatch = 1;
        this.second_leg_is_enabled = res?.data?.second_leg_is_enabled ;
        this.phases.forEach(phase => {
        phase.matchdays.forEach(day => {
            day.matches.forEach(match => {
            match.number = numeroMatch++;
            });
            day.groupedMatchesByDate = this.groupMatchesByDate(day.matches);
        });
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    else
        this.saisonService.getByGroupId(this.seasonId, this.groupId).subscribe({

      next: (res: any) => {
        this.leagueName=res?.data?.name
        this.leagueLogo=res?.data?.logo
        this.startDate=res?.data?.start_date
        this.endDate=res?.data?.end_date
        this.poolName=res?.data?.pools[0]?.name
        this.second_leg_is_enabled = res?.data?.pools[0]?.second_leg_is_enabled ;
        let calendar= res?.data?.pools[0]?.phases;
        this.phases=[]
        this.phases.push(calendar?.first_leg)
        this.phases.push(calendar?.second_led);
        /* this.phases = res?.data?.calendar || []; */
        let numeroMatch = 1;
        this.phases.forEach(phase => {
        phase.matchdays.forEach(day => {
            day.matches.forEach(match => {
            match.number = numeroMatch++;
            });
            day.groupedMatchesByDate = this.groupMatchesByDate(day.matches);
        });
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    }



    formatDate(dateStr: string): string {
      return formatDate(dateStr, 'dd/MM/yyyy', 'fr-FR');
    }

    groupMatchesByDate(matches: Match[]): any[] {
  const grouped: { [date: string]: Match[] } = {};

  for (const match of matches as any) {
    const [day, month, year] = match?.match_date?.split("/").map(Number);
    let formattedDate = new Date(year, month - 1, day);
    const dateKey = new Date(formattedDate).toISOString().split('T')[0]; // ex: "2025-08-12"
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(match);
  }

  const result: any[] = Object.entries(grouped).map(([date, matches]) => ({
    date,
    matches,
  }));

  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return result;
}

exportAsExcel(phase: Phase) {
  const rows: any[] = [];

  phase.matchdays.forEach((day, index) => {
    day.matches.forEach((match:any) => {
        let [day, month, year] = match?.match_date?.split("/").map(Number);
    let formattedDate = new Date(year, month - 1, day);
      rows.push({
        'Journée': day.label,
        'Équipe 1': match.team1,
        'Équipe 2': match.team2,
        'Stade': match.stadium,
        'Date': new Date(formattedDate).toLocaleDateString(),
        'Heure': match.time
      });
    });
  });

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rows);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Calendrier': worksheet },
    SheetNames: ['Calendrier']
  };

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const filename = `${phase.name.replace(/\s+/g, '_')}_calendrier.xlsx`;
  saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), filename);
}

async exportPdf() {
/*   this.exportingPdf = true;
        const element = this.componentToExportRef.nativeElement;
          // Use html2canvas to convert the HTML element to a canvas
        const canvas = await html2canvas(element);

        // Or, if using dom-to-image:
        // const dataUrl = await domToImage.toPng(element);
        // const img = new Image();
        // img.src = dataUrl;
        // document.body.appendChild(img); // For debugging, optional

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for units, 'a4' for size
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
        }

        pdf.save('exported-component.pdf');
        this.exportingPdf = false;
 */


}


  exportCalendarToPdf(): void {
      this.loading = true;
      setTimeout(() => {
        this.pdfGeneratorService.generateCalendarPdf(this.phases[this.selectedPhaseIndex],this.leagueName!,this.leagueLogo!,this.startDate!,this.endDate!, this.poolName, 'calendrier.pdf')
        .then(() => {
          this.loading = false;
      });
      }, 0);



    }

  openRescheduleDialog(match: any,date:string, match_day_id:string, match_day_start:string, match_day_end:string): void {
    this.newMatchDateControl=new FormControl(new Date(date),[Validators.required,this.dateRangeValidator(new Date(match_day_start),new Date(match_day_end),)]);
    this.newMatchStadiumControl.patchValue(match.stadium_id)
    this.isDerbyControl.patchValue(match.is_derby?true:false)
    this.newMatchDayControl.patchValue(match_day_id);
    let timeDateObject= new Date()
    const [hours, minutes] = match.time.split(':').map(Number);
    timeDateObject.setHours(hours);
    timeDateObject.setMinutes(minutes);
    timeDateObject.setSeconds(0);
    timeDateObject.setMilliseconds(0);
    this.newMatchTimeControl.patchValue(timeDateObject);
    this.selectedMatch = match;
    this.newTeam1Control.patchValue(match.team1_id);
    this.newTeam2Control.patchValue(match.team2_id);
    // Initialize dialog fields with current match data if needed
    // For example, if you want to pre-select the current matchday in the dropdown
    // this.selectedMatchday = match.matchdayId; // Assuming match has a matchdayId
    // this.newMatchDate = new Date(match.date); // Assuming match.date is a valid date string/object


    this.displayRescheduleDialog = true;
  }

dateRangeValidator(minDate: Date, maxDate: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const inputDate = new Date(control.value);



    if (inputDate < minDate || inputDate > maxDate) {
      return { 'dateOutOfRange': { min: minDate.toISOString().split('T')[0], max: maxDate.toISOString().split('T')[0], actual: inputDate.toISOString().split('T')[0] } };
    }
    return null;
  };
}

    loadStadiums(): void {
        this.stadeService.getAll().subscribe({
            next: (res: any) => {
                this.stadiums = res?.data?.stadiums || [];
            },
            error: (err) => {
                console.error('Erreur lors du chargement des stades', err);
            },

        });
    }

    closeRescheduleDialog(): void {
        this.displayRescheduleDialog = false;
        this.newMatchDateControl.reset();
        this.newMatchStadiumControl.reset();
        this.newMatchDayControl.reset();
        this.isDerbyControl.reset();
        this.newMatchTimeControl.reset();
        this.newTeam1Control.reset();
        this.newTeam2Control.reset();
    }

    submitRescheduleForm(

    ){
        if (
            this.newMatchDateControl.hasError('required') ||
            this.newMatchStadiumControl.hasError('required') ||
            this.newMatchDayControl.hasError('required') ||
            this.newMatchTimeControl.hasError('required') ||
            this.newTeam1Control.hasError('required') ||
            this.newTeam2Control.hasError('required')
            )
            return

        this.formLoading=true

          const hours = this.newMatchTimeControl.value!.getHours().toString().padStart(2, '0');
  const minutes = this.newMatchTimeControl.value!.getMinutes().toString().padStart(2, '0');

  const formattedTime = `${hours}:${minutes}`;

         this.matchService.reschedule(
            this.selectedMatch?.football_match_id,
            {
                scheduled_at: this.newMatchDateControl.value,
                stadium_id: this.newMatchStadiumControl.value,
                match_day_id: this.newMatchDayControl.value,
                is_derby: this.isDerbyControl.value?1:0,
                team_one_id: this.newTeam1Control.value,
                team_two_id: this.newTeam2Control.value,
                match_start_time: formattedTime

            }
        ).subscribe({
            next:(res:any)=>{
                this.formLoading=false
                this.closeRescheduleDialog();
                this.getCalendar();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Match reprogrammé avec succès',
                })
            },
            error: (err) => {
                this.formLoading=false
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Une erreur s'est produite.",
                })

            }
        })
    }

      loadTeams(): void {
    this.loading = true;
    this.equipeService.getAll().subscribe({
      next: (res: any) => {
        this.teams = res?.data.teams || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des équipes',
        });
      }
    });
  }

    get filteredTeams(): Team[] {
    return this.teams.filter(team =>
      true
    );
  }

  truncateStadiumName(stadiumName: string): string {
    if (stadiumName.length > 33) {
      return stadiumName.substring(0, 33) + '...';
    }
    return stadiumName;
  }

  truncateTeamName(stadiumName: string): string {
    if (stadiumName.length > 10) {
      return stadiumName.substring(0, 8) + '..';
    }
    return stadiumName;
  }

  openFormSelectDialog(matchDay:Matchday): void {
    this.selectedMatchDay=matchDay
    //this.displayFormSelectDialog = true;
    this.displayMatchDayReplaceDialog = true;
  }
  closeFormSelectDialog(): void {
    this.displayFormSelectDialog = false;
    this.formSelectControl.reset();
  }

  submitFormSelect(){
    this.displayFormSelectDialog = false;
    if (this.formSelectControl.value === 'replace')
      this.displayMatchDayReplaceDialog = true;
    else
      this.displayMatchDayRescheduleDialog = true;

  }

  closeMatchDayReplaceDialog() {
    this.displayMatchDayReplaceDialog = false;
    this.matchDayToReplaceControl.reset();
}
submitMatchDayReplaceForm() {
    this.formLoading=true
    this.matchDayService.replace({
        matchday1_id: this.selectedMatchDay?.match_day_id,
        matchday2_id: this.matchDayToReplaceControl.value
    }).subscribe({
      next: (res: any) => {
        this.teams = res?.data.teams || [];
        this.formLoading=false
        this.matchDayToReplaceControl.reset();
        this.displayMatchDayReplaceDialog = false;
        this.getCalendar();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Journée remplacée avec succès',
        })
      },
      error: () => {
        this.formLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Une erreur s'est produite.",
        });
      }
    });
}

  closeMatchDayRescheduleDialog() {
    this.displayMatchDayRescheduleDialog = false;
    this.matchDayStartControl.reset();
    this.matchDayEndControl.reset();
}
submitMatchDayRescheduleForm() {
throw new Error('Method not implemented.');
}

loadSwappableMatches(){
this.matchDayService.getSwappableMatchDays(this.selectedMatchDay!.match_day_id!).subscribe({
  next: (res: any) => {
    this.swappableMatchDays= res?.swappable_matchdays || [];
    this.loading = false;
  },
  error: () => {
    this.loading = false;
    this.displayMatchDayReplaceDialog = false;
    this.matchDayToReplaceControl.reset();
    this.getCalendar();
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Erreur lors du chargement des journées remplaçables',
    });
  }
})
}

get allMatchDays(){
    let matchDays:Matchday[]=[]
    this.phases.forEach(phase => {
        phase.matchdays.forEach(day => {
            matchDays.push(day)
        });
    })
    return matchDays
}

onGroupChange(event: any) {
  this.groupId = event.value;
  this.getCalendar();
}

initGenerateForm() {
    const initialTime = new Date();
    initialTime.setHours(16); // Set hours
    initialTime.setMinutes(0); // Set minutes
    initialTime.setSeconds(0);
    initialTime.setMilliseconds(0);
  this.generateForm = this.fb.group({
      second_leg_start: [null, Validators.required],
      second_leg_end: [null, Validators.required],
      match_start_time: [initialTime, Validators.required],
      min_hours_between_team_matches: [48, Validators.required],
      //min_days_between_phases: [30, Validators.required],
      allowed_match_days: [[ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], Validators.required],
      skip_dates: this.fb.array([]),

});


}

getSkipDatesArray() {
  return this.generateForm.get('skip_dates') as FormArray;
}


addSkipDate() {
  const date = this.skipDateControl.value;
  if (date && !this.skipDateExistsByGroup(date)) {
    this.getSkipDatesArray().push(this.fb.group({ date: [date] }));
    this.skipDateControl.reset();
  }
}

private skipDateExistsByGroup(date: Date): boolean {
  return this.getSkipDatesArray().controls.some(
    ctrl => new Date(ctrl.value.date).toDateString() === date.toDateString()
  );
}

removeSkipDate(index: number) {
  this.getSkipDatesArray().removeAt(index);
}

openGenerateDialog() {
  this.displayGenerateDialog = true;
}

closeGenerateDialog() {
  this.displayGenerateDialog = false;
  this.initGenerateForm();
  this.getSkipDatesArray().clear();
}

submitGenerateForm() {
  if (this.generateForm.invalid) {
    return;
  }
  this.formLoading = true;
  let payload:any={}
    payload.season_id = this.seasonId;
    payload.pool_id = this.groupId;
    payload.start_date = this.generateForm.value.second_leg_start;
    payload.end_date = this.generateForm.value.second_leg_end;
    payload.match_start_time = formatDate(this.generateForm.value.match_start_time, 'HH:mm', 'fr-FR');
    payload.min_hours_between_team_matches = this.generateForm.value.min_hours_between_team_matches;
    payload.allowed_match_days = this.generateForm.value.allowed_match_days;
    payload.skip_dates = this.generateForm.value.skip_dates;
  console.log(this.generateForm.value);
  this.saisonService.generate(payload).subscribe({

    next: (res: any) => {
      this.formLoading = false;
      this.displayGenerateDialog = false;
      this.getCalendar();
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Phase retour (ré)géneree avec succès',
      });
    },
    error: () => {
      this.formLoading = false;

      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Une erreur s'est produite.",
      });
    }
  });


}}
