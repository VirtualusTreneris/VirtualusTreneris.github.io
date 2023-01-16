import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { YouTubePlayer } from '@angular/youtube-player';
import { ConfigurationService } from '../configuration.service';
import { ICategory, IExercise } from '../models/configuration.model';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, OnDestroy {

  loaded: boolean = false;

  exercise: IExercise | null = null;
  category: ICategory | null = null;

  width: number = 500;
  height: number = 250;

  redirectTimer: any;
  redirectTimerDelays: { ended: number, paused: number } = {
    ended: 20000,
    paused: 300000
  }

  playerVars: YT.PlayerVars = {
    autoplay: 1,
    start: 1
  }

  @ViewChild('ytPlayer')
  player!: YouTubePlayer;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateVideoPlayerSize(window);
  }

  constructor(private configurationService: ConfigurationService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.updateVideoPlayerSize(window);

    this.exercise = this.configurationService.exercise;
    this.category = this.configurationService.category;
    this.loaded = true;

  }

  ngOnDestroy(): void {
    this.configurationService.title = this.category?.name ?? '';
    this.configurationService.exercise = null;
  }

  updateVideoPlayerSize = (window: any) => {
    this.width = window.innerWidth - 150;
    this.height = window.innerHeight - 150;
  }

  parseYoutubeId = (url: string | undefined) => {
    if (!url) return '';

    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    }
    return ''
  }

  onStateChange = ({ data: state }: { data: number }) => {
    if (state === YT.PlayerState.PAUSED) {
      this.redirectToFrontPage(this.redirectTimerDelays.paused);
    } else if (state === YT.PlayerState.PLAYING) {
      clearTimeout(this.redirectTimer);
    } else if (state === YT.PlayerState.ENDED) {
      this.redirectToFrontPage(this.redirectTimerDelays.ended);
    }
  }

  redirectToFrontPage = (delay: number) => {
    this.redirectTimer = setTimeout(() => {
      this.configurationService.page = this.configurationService.pages[0];
      this.configurationService.category = null;
      this.configurationService.exercise = null;
      this.configurationService.title = '';
    }, delay);
  }
}
