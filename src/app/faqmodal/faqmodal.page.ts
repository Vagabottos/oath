import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Tesseract from 'tesseract.js';

import { ModalController } from '@ionic/angular';
import { read } from 'fs';

@Component({
  selector: 'app-faqmodal',
  templateUrl: './faqmodal.page.html',
  styleUrls: ['./faqmodal.page.scss'],
})
export class FAQModalPage implements OnInit {

  @ViewChild('camera') camera: ElementRef<HTMLVideoElement>;

  private streams = [];

  constructor(private modalCtrl: ModalController) { }

  async ngOnInit() {
    const { createWorker, createScheduler } = Tesseract;
    const scheduler = createScheduler();
    
    // attach camera output to video tag
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      this.camera.nativeElement.srcObject = stream;
  
      this.streams = stream.getVideoTracks();
      const mediaStreamTrack = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(mediaStreamTrack);
    
      const worker = createWorker();
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      scheduler.addWorker(worker);

      let stopTrying = false;
      
      const tryRecognize = async () => {

        console.log('trying');
        const blob = await imageCapture.takePhoto();
        blob.name = 'ocr';
        console.log(blob)

        const res = await scheduler.addJob('recognize', blob);
        console.log(res)

        if(stopTrying) return;
        setTimeout(tryRecognize, 1000);
      };

      tryRecognize();

    } catch(e) {
      console.error(e);
    }
    
  }

  dismiss(id?: string) {
    this.modalCtrl.dismiss(id);

    this.streams.forEach(stream => stream.stop());
    this.camera.nativeElement.srcObject = null;
  }

}
