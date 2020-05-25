import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CountdownComponent } from 'ngx-countdown';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  landModal; //Modal acciones terreno

  game = false;
  gameStarted = false;

  players; // Lista de jugadores
  board; // Tablero
  boardLands; // Tierras del tablero

  sLand; // Terreno seleccionado

  countdown = 10;

  boardTypes = [
    {
      'id': 1,
      'text': '2*2',
      'col': 'col-6',
      'cols': 4,
    },
    {
      'id': 2,
      'text': '3*3',
      'col': 'col-4',
      'cols': 9,
    },
    {
      'id': 3,
      'text': '4*4',
      'col': 'col-3',
      'cols': 16,
    },
    {
      'id': 4,
      'text': '6*6',
      'col': 'col-2',
      'cols': 36,
    },
    {
      'id': 5,
      'text': '8*8',
      'col': 'col-1',
      'cols': 64,
    },
  ];

  constructor(
    private modalService: NgbModal,
  ) {
    this.players = [];
    this.board = 0;

    this.players = [
      {
        "id": 1,
        "name": "Adur",
        "color": "#00ff00",
        "warriors": 0,
        "points": 0,
        'turn': false,
      },
      {
        "id": 2,
        "name": "Jon",
        "color": "#0000ff",
        "warriors": 0,
        "points": 0,
        'turn': false,
      },
      {
        "id": 3,
        "name": "Noe",
        "color": "#ff0000",
        "warriors": 0,
        "points": 0,
        'turn': false,
      }
    ];

    this.board = {
      "type": 3,
      "col": "col-3",
      "cols": 16
    };

    this.boardLands = [
      {
        "id": 1,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 2,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 3,
        "warriors": 2,
        "userId": 2
      },
      {
        "id": 4,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 5,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 6,
        "warriors": 1,
        "userId": 1
      },
      {
        "id": 7,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 8,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 9,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 10,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 11,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 12,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 13,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 14,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 15,
        "warriors": 0,
        "userId": 0
      },
      {
        "id": 16,
        "warriors": 0,
        "userId": 0
      }
    ];


  }

  ngOnInit(): void {
    this.game = true;
  }

  // Seleccionar cantidad de jugadores
  selectPlayersQuantity(playersQuantity: number) {
    this.players = [];

    for (let p = 0; p < playersQuantity; p++) {
      this.players.push(
        {
          'id': p + 1,
          'name': '',
          'color': '#fff',
          'warriors': 0,
          'points': 0,
          'turn': false,
        }
      );
    }
  }

  // Seleccionar tipo de tablero 
  selectBoard(boardType) {
    this.board = {
      'type': boardType.id,
      'col': boardType.col,
      'cols': boardType.cols,
    };

    this.boardLands = [];

    for (let b = 0; b < boardType.cols; b++) {
      this.boardLands.push(
        {
          'id': b + 1,
          'userId': 0,
          'warriors': 0,
        }
      );
    }
  }

  // Seleccionar color del jugador
  setColor(playerIndex: number, color: string) {
    this.players[playerIndex].color = color;
  }

  // Botón disabled
  incompletePlayers() {
    if (this.players.findIndex(player => player.color == '#fff') >= 0) {
      return true;
    } else if (this.players.findIndex(player => player.name == '') >= 0) {
      return true;
    } else {
      return false;
    }
  }

  /* JUEGO */

  startGame() {
    this.gameStarted = true;

    this.firstTurn();

    this.timer();
  }
  //Seleccionar primer turno
  firstTurn() {
    const userId = Math.round(Math.random() * this.players.length + 1);

    this.addTurn(userId);
  }

  async timer() {
    for (let i = 0; i < 10; i++) {
      await this.delay();
      this.countdown -= 1;
    }

    this.countdown = 10;

    this.changeTurn();
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  //Cambiar turno
  changeTurn() {
    this.timer();

    //Buscar jugador que posee el turno actual
    const turnPlayer = this.turnPlayer();

    let userId = 1;

    // Comprobar que exista el siguiente jugador
    if (this.turnPlayer().id + 1 <= this.players.length) {
      userId = this.turnPlayer().id + 1;
    }

    this.addTurn(userId);

    turnPlayer.turn = false;
  }

  addTurn(id) {
    // Asignar turno y añadir guerrero
    const newTurnPlayer = this.findPlayerById(id);
    newTurnPlayer.turn = true;
    newTurnPlayer.warriors += 1;
  }

  openLandModal(content, land) {
    this.sLand = land;

    this.landModal = this.modalService.open(content, { size: 'sm', centered: true });
  }

  closeLandModal() {
    this.landModal.close();
  }

  findPlayerById(id: number) {
    return this.players.find(player => player.id == id);
  }

  // Jugador del turno actual
  turnPlayer() {
    return this.players.find(player => player.turn == true);
  }
}


