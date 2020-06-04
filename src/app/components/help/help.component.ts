import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  languaje = '1';

  instructions = {
    'eng': [
      {
        'title': 'Game setup',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
      {
        'title': 'Turns',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
      {
        'title': 'Warriors',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
      {
        'title': 'Castles',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
      {
        'title': 'End of the game',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
    ],
    'es': [
      {
        'title': 'Configuración de la partida',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
      {
        'title': 'Turnos',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
      {
        'title': 'Guerreros',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
      {
        'title': 'Castillos',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
      {
        'title': 'Fin de la partida',
        'description': 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        'img': '',
      },
    ],
  };


  constructor() { }

  ngOnInit(): void { }

  getInstruccions() {
    switch (this.languaje) {
      case '0':
        return this.instructions['eng'];

      case '1':
        return this.instructions['es'];
    }
  }
}
