import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  landModal; //Modal acciones terreno
  attackModal; //Modal del resultado del ataque

  game = false;
  gameStarted = false;

  players; // Lista de jugadores
  board; // Tablero
  boardLands; // Tierras del tablero

  sLandIndex; //Index del terreno seleccionado
  mLandIndex; //Index del terreno a mover

  countdown = 30; // Cuenta atras

  playerTurnIndex = 0; // Index del usuario del turno

  roundNumber = 0; // Número de ronda

  warriorsQuantity = 1; // Cantidad de guerreros a mover
  addWarriorsQuantity = 1; // Cantidad de guerreros a añadir

  selectableTerrains = [];

  attackWarriors; // Atacantes
  attackResult; // Resultado del ataque

  move = false;

  boardTypes = [
    {
      'id': 1,
      'text': '2 x 2',
      'col': 'col-6',
      'cols': 4,
      'row': 2,
    },
    {
      'id': 2,
      'text': '3 x 3',
      'col': 'col-4',
      'cols': 9,
      'row': 3,
    },
    {
      'id': 3,
      'text': '4 x 4',
      'col': 'col-3',
      'cols': 16,
      'row': 4,
    },
    {
      'id': 4,
      'text': '6 x 6',
      'col': 'col-2',
      'cols': 36,
      'row': 6,
    },
  ];

  constructor(
    private modalService: NgbModal,
  ) {
    this.players = [];
    this.board = 0;
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

    if (this.players.length == 3 && this.players.length == this.board.type + 2) {
      this.board.type = 2;
    } else if (this.players.length == 4 && this.players.length == this.board.type + 2) {
      this.board.type = 3;
    }
  }

  // Seleccionar tipo de tablero 
  selectBoard(boardType) {
    if (this.players.length <= boardType.id + 1) {
      this.board = {
        'type': boardType.id,
        'col': boardType.col,
        'cols': boardType.cols,
        'row': boardType.row,
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

  /****************************************************************************************/
  /*                                      TURNOS                                          */
  /****************************************************************************************/

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

    this.resetPlayerChanges();
  }

  // Asignar turno al jugador y añadir guerreros
  addTurn(playerIndex) {
    this.roundNumber += 1;

    let warriors = Math.round((Math.random() * this.players.length) + (this.roundNumber / 20));

    if (warriors == 0) {
      warriors = 1;
    } else if (warriors >= 8) {
      warriors = 8;
    }

    this.playerTurnIndex = playerIndex;

    // No acumular más de 20 guerreros
    if ((this.players[playerIndex].warriors + warriors) > 20) {
      this.players[playerIndex].warriors = 20;
    } else {
      this.players[playerIndex].warriors += warriors;
    }
  }

  // Cuenta atras
  async timer() {
    for (let i = 0; i < 30; i++) {
      await this.delay();
      this.countdown -= 1;

      if (this.countdown == 0) {
        this.changeTurn();
        this.countdown = 30;
      }
    }

    this.timer();
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Resetear los valores
  resetPlayerChanges() {
    this.sLandIndex = null;
    this.mLandIndex = null;

    this.warriorsQuantity = 1;
    this.addWarriorsQuantity = 1;

    if (this.landModal) {
      this.closeLandModal();
    }
  }

  /****************************************************************************************/
  /*                                      TERRENOS                                        */
  /****************************************************************************************/

  // Seleccionar terrero y abrir modal
  openLandModal(content, landIndex) {
    if (this.gameStarted) {
      this.sLandIndex = landIndex;

      if (this.sLand().userId == this.turnPlayer().id || this.sLand().userId == 0) {

        if (this.sLand().warriors > 0) {
          this.landModal = this.modalService.open(content, { centered: true });
        } else {
          this.landModal = this.modalService.open(content, { size: 'sm', centered: true });
        }

      }
    }
  }

  // Cerrar terreno
  closeLandModal() {
    this.landModal.close();
  }

  // Mover guerreros
  selectTerrainToMove(attackModal, landIndex) {
    this.mLandIndex = landIndex;
    this.moveWarriors(attackModal);
  }

  // Mostrar las tierras a las que se pueden mover los guerreros
  canMove(terrainIndex: number) {
    if (this.selectableTerrains.findIndex(terrain => terrain == terrainIndex) != -1) {
      return true;
    }
    return false;
  }

  // Mostrar botones agregar y mover guerreros
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

  // Mostrar terrenos a donde se pueden mover los guerreros
  showMoveOptions() {
    if (this.warriorsQuantity <= this.sLand().warriors) {
      this.move = true;

      const selectableTerrains = [
        this.sLandIndex - this.board.row,
        this.sLandIndex - 1,
        this.sLandIndex + 1,
        this.sLandIndex + this.board.row
      ];

      this.selectableTerrains = [];

      for (let i = 0; i < selectableTerrains.length; i++) {
        if (selectableTerrains[i] >= 0 && selectableTerrains[i]) {

          if (this.pushTerrain(i, selectableTerrains) == true) {
            this.selectableTerrains.push(selectableTerrains[i]);
          }

          if (this.sLandIndex == this.board.row || this.sLandIndex == 1) {
            this.selectableTerrains.push(0);
          }
        }
      }

      this.closeLandModal();
    }
  }

  // Mostrar correctamente las opciones de movimiento
  pushTerrain(index, selectableTerrains) {
    for (let e = 1; e < this.board.row + 1; e++) {

      // Izquierda
      if (this.sLandIndex == (this.board.row * e) && selectableTerrains[index] == (this.board.row * e - 1)) {
        return false;
      }
      // Derecha
      else if (this.sLandIndex == (this.board.row * e) - 1 && selectableTerrains[index] == (this.board.row * e)) {
        return false;
      }
    }

    return true;
  }

  /*******************************************************************************************/
  /*                                      GUERREROS                                          */
  /*******************************************************************************************/

  // Añadir guerreros a un terrreno
  addWarriors() {
    if (this.addWarriorsQuantity <= this.turnPlayer().warriors) {
      this.sLand().warriors += this.addWarriorsQuantity;
      this.sLand().userId = this.turnPlayer().id;

      this.turnPlayer().warriors -= this.addWarriorsQuantity;

      this.closeLandModal();

      this.changeTurn();
    }
  }

  // Mover los guerreros
  moveWarriors(attackModal) {
    if (this.selectableTerrains.findIndex(terrain => terrain == this.mLandIndex) != -1) {

      // Si el terreno destino no tiene dueño asignamos jugador 
      if (this.mLand().userId == 0 || this.mLand().userId == this.turnPlayer().id) {
        this.mLand().userId = this.turnPlayer().id;
        this.mLand().warriors += this.warriorsQuantity;

      } else {
        const result = this.attack(this.warriorsQuantity, this.mLand().warriors);

        this.mLand().warriors = result['mWarriors'];

        if (this.mLand().warriors == 0) {
          this.mLand().userId = this.turnPlayer().id;
          this.mLand().warriors = result['sWarriors'];
        }

        // Mostrar resultado ataque
        this.openAttackModal(attackModal);
      }

      this.sLand().warriors -= this.warriorsQuantity;

      // Si el terreno se queda vacío quitar al usuario
      if (this.sLand().warriors == 0) {
        this.sLand().userId = 0;
      }

      this.changeTurn();
    }

    this.move = false;
  }

  attack(sWarriors: number, mWarriors: number) {
    this.attackWarriors = {
      'sWarriors': sWarriors,
      'mWarriors': mWarriors
    }

    const number = Math.floor(Math.random() * 10) + 1;

    let valores = [1.5, 1.3, 1.1, 1.1, 1.3, 1.5];

    if (sWarriors <= 20) {
      valores = [1.3, 1.2, 1.1, 1.1, 1.2, 1.3];
    }


    // Mucha diferencia del atacante al defensor
    if ((sWarriors / mWarriors) > 10) {

      const option = Math.floor(Math.random() * 3) + 1;

      switch (option) {
        case 1:
          sWarriors = sWarriors;
          break;
        case 2:
          sWarriors = sWarriors + (mWarriors / 2);
          break;
        case 3:
          sWarriors = sWarriors + mWarriors;
          break;
      }
    }

    else if ((mWarriors / sWarriors) > 10) {
      const option = Math.floor(Math.random() * 3) + 1;

      switch (option) {
        case 1:
          mWarriors = mWarriors;
          break;
        case 2:
          mWarriors = mWarriors - (sWarriors / 2);
          break;
        case 3:
          mWarriors = mWarriors - sWarriors;
          break;
      }
    }

    // Poca diferencia del atacante al defensor
    else {
      switch (number) {
        case 1:
          sWarriors /= valores[0];
          break;
        case 2:
          sWarriors /= valores[1];
          break;
        case 3:
          sWarriors /= valores[2];
          break;
        case 8:
          sWarriors *= valores[3];
          break;
        case 9:
          sWarriors *= valores[4];
          break;
        case 10:
          sWarriors *= valores[5];
          break;
      }
    }

    const attack = sWarriors - mWarriors;

    let win;

    // Gana
    if (sWarriors > mWarriors) {
      win = true;
      mWarriors = 0;
      sWarriors = attack;

      if (sWarriors == 0) {
        sWarriors = 1;
      }
      // Pierde
    } else if (sWarriors < mWarriors) {
      win = false;
      mWarriors -= sWarriors;

      if (mWarriors == 0) {
        mWarriors = 1;
      }

      sWarriors = 0;
    }

    // Empate
    else {
      if (number == 4 || number == 5) {
        win = true;
        sWarriors = 1;
        mWarriors = 0;
      } else if (number == 6) {
        win = false;
        sWarriors = 0;
        mWarriors = 1;
      }
    }

    Math.round(sWarriors);
    Math.round(mWarriors);

    const attackResult = {
      'attacker': this.turnPlayer().name,
      'defender': this.findPlayerById(this.mLand().userId).name,
      'win': win,
      'sWarriors': sWarriors,
      'mWarriors': mWarriors,
    };

    this.attackResult = attackResult;

    return attackResult;
  }

  // Abrir modal del ataque
  openAttackModal(attackModal) {
    this.attackModal = this.modalService.open(attackModal, { size: 'sm', centered: true });
  }

  // Cerrar ataque
  closeAttackModal() {
    this.attackModal.close();
  }

  /*******************************************************************************************/
  /*                                         OTROS                                           */
  /*******************************************************************************************/

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

  mLand() {
    return this.boardLands[this.mLandIndex];
  }
}


