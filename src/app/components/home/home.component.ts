import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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

  sLandIndex; //Index del terreno seleccionado

  countdown = 30; // Cuenta atras

  playerTurnIndex = 0; // Index del usuario del turno

  roundNumber = 0; // Número de ronda

  boardTypes = [
    {
      'id': 1,
      'text': '2 x 2',
      'col': 'col-6',
      'cols': 4,
    },
    {
      'id': 2,
      'text': '3 x 3',
      'col': 'col-4',
      'cols': 9,
    },
    {
      'id': 3,
      'text': '4 x 4',
      'col': 'col-3',
      'cols': 16,
    },
    {
      'id': 4,
      'text': '6 x 6',
      'col': 'col-2',
      'cols': 36,
    },
    {
      'id': 5,
      'text': '12 x 12',
      'col': 'col-1',
      'cols': 144,
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
      },
      {
        "id": 2,
        "name": "Jon",
        "color": "#0000ff",
        "warriors": 0,
        "points": 0,
      },
      {
        "id": 3,
        "name": "Noe",
        "color": "#ff0000",
        "warriors": 0,
        "points": 0,
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

    this.game = true;
  }

  ngOnInit(): void { }

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
          'points': 0
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

  // Mostrar tablero
  start() {
    this.game = true;
  }

  // Empezar los turnos
  startGame() {
    this.gameStarted = true;

    this.firstTurn();

    this.timer();
  }

  //Seleccionar primer turno
  firstTurn() {
    const playerIndex = Math.round(Math.random() * this.players.length);

    this.addTurn(playerIndex);
  }

  //Cambiar turno
  changeTurn() {
    this.countdown = 30;

    let playerIndex = 0;

    // Comprobar que exista el siguiente jugador
    if (this.playerTurnIndex + 2 <= this.players.length) {
      playerIndex = this.playerTurnIndex + 1;
    }

    this.addTurn(playerIndex);
  }

  // Asignar turno al jugador y añadir guerreros
  addTurn(playerIndex) {
    this.roundNumber += 1;

    const warriors = Math.round(Math.random() * (this.players.length + this.board.type) + 1);

    this.playerTurnIndex = playerIndex;

    this.players[playerIndex].warriors += warriors;
  }

  // Cuenta atras
  async timer() {
    for (let i = 0; i < 30; i++) {
      await this.delay();
      this.countdown -= 1;
    }

    this.countdown = 30;

    this.changeTurn();

    this.timer();
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Seleccionar terrero y abrir modal
  openLandModal(content, landIndex) {
    if (this.gameStarted) {
      this.sLandIndex = landIndex;

      this.landModal = this.modalService.open(content, { size: 'sm', centered: true });
    }
  }

  showButtons(button) {
    switch (button) {
      case 'add':

        if (this.turnPlayer() && this.turnPlayer().warriors > 0) {
          if (this.sLand().userId == this.turnPlayer().id || this.sLand().userId == 0) {
            return true;
          }
          return false;
        }

        return false;

      case 'move':

        if (this.turnPlayer() && this.sLand().userId == this.turnPlayer().id && this.sLand().warriors > 0) {
          return true;
        }

        return false;
    }
  }

  // Añadir guerreros a un terrreno
  addWarriors(warriorsQuantity) {
    this.boardLands[this.sLandIndex].warriors += warriorsQuantity;
    this.boardLands[this.sLandIndex].userId = this.players[this.playerTurnIndex].id;

    this.turnPlayer().warriors -= warriorsQuantity;

    this.closeLandModal();
  }

  // Cerrar terreno
  closeLandModal() {
    this.landModal.close();
  }

  // Buscar jugador por ID
  findPlayerById(id: number) {
    return this.players.find(player => player.id == id);
  }

  // Jugador del turno actual
  turnPlayer() {
    return this.players[this.playerTurnIndex];
  }

  sLand() {
    return this.boardLands[this.sLandIndex];
  }
}


