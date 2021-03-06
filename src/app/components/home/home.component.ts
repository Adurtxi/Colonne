import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  @ViewChild('victoryModal') private victoryModalContent;
  @ViewChild('attackModal') private attackModalContent;

  landModal; //Modal acciones terreno
  attackModal; //Modal del resultado del ataque
  shopModal; //Modal de tienda
  victoryModal; //Modal del ganador

  // Configuraciones del juego
  game = {
    'view': false,
    'started': false,
    'background': 1,
    'roundNumber': 0,
    'roundTime': 30,
    'paused': false,
    'maxRounds': 0,
    'maxWarriors': 20,
    'maxMoney': 2000,
    'velocity': 1,
    'sound': true,
  };

  countdown = this.game.roundTime;

  players = []; // Lista de jugadores
  board; // Tablero
  boardLands; // Tierras del tablero

  sLandIndex; //Index del terreno seleccionado
  mLandIndex; //Index del terreno a mover
  playerTurnIndex = 0; // Index del usuario del turno
  sUpgradeIndex; //Index de la tarjeta seleccionada

  warriorsQuantity = 1; // Cantidad de guerreros a mover
  addWarriorsQuantity = 1; // Cantidad de guerreros a añadir

  selectableTerrains = [];

  attackWarriors; // Atacantes
  attackResult; // Resultado del ataque

  move = false;
  count = 0;

  tictac = false;

  boardTypes = [
    { 'id': 1, 'text': '2 x 2', 'col': 'col-6', 'cols': 4, 'row': 2, },
    { 'id': 2, 'text': '3 x 3', 'col': 'col-4', 'cols': 9, 'row': 3, },
    { 'id': 3, 'text': '4 x 4', 'col': 'col-3', 'cols': 16, 'row': 4, },
    { 'id': 4, 'text': '6 x 6', 'col': 'col-2', 'cols': 36, 'row': 6, },
  ];

  upgrades = [
    { 'id': 1, 'img': 'warriors-upgrade.png', 'price': 500 },
    { 'id': 2, 'img': 'castle-upgrade.png', 'price': 1000 },
  ];

  constructor(
    private modalService: NgbModal,
  ) {
    this.board = 0;
  }

  ngOnInit(): void { }

  // Fondo de la página
  gameBackground() {
    return 'url(assets/img/backgrounds/background' + this.game.background + '.jpg)';
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
          'money': 0,
          'alive': true,
          'dead': 0,
          'upgrades': {
            'warriors': false,
            'castle': false,
          }
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
            'castle': false,
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
    if (this.players.length == 0) {
      return true;
    } else if (this.players.findIndex(player => player.color == '#fff') >= 0) {
      return true;
    } else if (this.players.findIndex(player => player.name == '') >= 0) {
      return true;
    } else {
      return false;
    }
  }

  /****************************************************************************************/
  /*                                       JUEGO                                          */
  /****************************************************************************************/

  changeView() {
    this.game.view = true;
    this.countdown = this.game.roundTime;
  }

  // Empezar los turnos
  startGame() {
    this.game.started = true;
    this.game.paused = false;
    this.count = this.players.length;

    this.firstTurn();

    this.timer();
  }

  pauseGame() {
    this.game.paused = !this.game.paused;

    if (!this.game.paused) {
      this.timer();
    }
  }

  restart() {
    this.game = {
      'view': false,
      'started': false,
      'background': 1,
      'roundNumber': 0,
      'roundTime': 30,
      'paused': true,
      'maxRounds': 0,
      'maxWarriors': 20,
      'maxMoney': 2000,
      'velocity': 1,
      'sound': true,
    };

    this.move = false;
    this.board = 0;
    this.boardLands = [];
    this.players = [];
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
    if (this.count > 1) {
      this.tictac = false;

      const playerIndex = this.nextPlayer(this.playerTurnIndex + 1);

      this.addTurn(playerIndex);

      this.killPlayers();

      this.resetPlayerChanges();

      this.countdown = this.game.roundTime;
    }
  }

  // Comprobar si existe el siguiente jugador
  nextPlayer(playerIndex) {
    if (playerIndex < this.players.length) {
      if (this.players[playerIndex].alive) {
        return playerIndex;
      }

      return this.nextPlayer(playerIndex + 1);
    } else {
      if (this.players[0].alive) {
        return 0;
      }

      return this.nextPlayer(1);
    }
  }

  // Asignar turno al jugador y añadir guerreros
  addTurn(playerIndex) {
    this.playerTurnIndex = playerIndex;

    this.game.roundNumber += 1;

    let warriors = Math.round((Math.random() * this.players.length) + (this.game.roundNumber / 20));
    const money = Math.round((this.game.roundNumber * 50));

    if (warriors == 0) {
      warriors = 1;
    } else if (warriors >= 8) {
      warriors = 8;
    }

    // No acumular más de 20 guerreros
    if ((this.turnPlayer().warriors + warriors) > this.game.maxWarriors) {
      this.turnPlayer().warriors = this.game.maxWarriors;
    } else {
      this.turnPlayer().warriors += warriors;
    }

    // No acumular más de 2000 monedas
    if ((this.turnPlayer().money + money) > this.game.maxMoney) {
      this.turnPlayer().money = this.game.maxMoney;
    } else {
      this.turnPlayer().money += money;
    }
  }

  // Cuenta atras
  async timer() {
    for (let i = 0; i < this.countdown && this.game.paused != true; i++) {
      await this.delay();
      this.countdown -= 1;

      if (this.countdown <= 5) {
        this.playAudio();
      }

      if (this.countdown == 0) {
        this.changeTurn();
      }
    }

    this.timer();
  }

  playAudio() {
    if (!this.tictac && this.game.sound) {
      this.tictac = true;

      let audio = new Audio();
      audio.src = "assets/audio/tictac.mp3";
      audio.load();
      audio.play();
    }
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

    this.move = false;

    if (this.landModal) {
      this.closeLandModal();
    }
  }

  /****************************************************************************************/
  /*                                      TERRENOS                                        */
  /****************************************************************************************/

  // Seleccionar terrero y abrir modal
  openLandModal(content, landIndex) {
    if (this.game.started) {
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
  selectTerrainToMove(landIndex) {
    this.mLandIndex = landIndex;
    this.moveWarriors();
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
  moveWarriors() {
    // El terreno destino no tiene dueño o es del jugador
    if (this.mLand().userId == 0 || this.mLand().userId == this.turnPlayer().id) {
      this.mLand().userId = this.turnPlayer().id;
      this.mLand().warriors += this.warriorsQuantity;

    }
    // El terreno destino tiene dueño
    else {
      const result = this.attack(this.warriorsQuantity, this.mLand().warriors);

      this.mLand().warriors = result['mWarriors'];

      if (this.mLand().warriors == 0) {
        this.mLand().userId = this.turnPlayer().id;
        this.mLand().warriors = result['sWarriors'];
      }

      // Mostrar resultado ataque
      this.openAttackModal();
    }

    this.sLand().warriors -= this.warriorsQuantity;

    // Si el terreno se queda vacío y no hay castillo quitar al usuario
    if (this.sLand().warriors == 0 && !this.sLand().castle) {
      this.sLand().userId = 0;
    }

    this.changeTurn();
  }

  // Algoritmo de ataque
  attack(sWarriors: number, mWarriors: number) {
    // Guerreros en batalla
    this.attackWarriors = {
      'castle': this.mLand().castle,
      'sWarriors': sWarriors,
      'mWarriors': mWarriors
    }

    // Hacer más fuertes los guerreros en caso de estar mejorados
    if (this.turnPlayer().upgrades.warriors) {
      sWarriors *= 1.5;
    } if (this.findPlayerById(this.mLand().userId).upgrades.warriors) {
      mWarriors *= 1.5;
    }

    const number = Math.floor(Math.random() * 10) + 1;

    let values = [1.5, 1.3, 1.1, 1.1, 1.3, 1.5];
    // En caso de ser pocos guerreros no hacerlos ni muy fuertes ni muy débiles
    if (sWarriors <= 20 || mWarriors <= 20) {
      values = [1.3, 1.2, 1.1, 1.1, 1.2, 1.3];
    }

    let castleDefence = 0;

    // El defensor tiene castillo
    if (this.mLand().castle) {

      // El defensor tiene el castillo mejorado
      if (this.findPlayerById(this.mLand().userId).upgrades.castle) {
        // La fuerza del castillo es el 35% de los guerreros
        castleDefence = Math.round(mWarriors * 0.35);
      } else {
        // La fuerza del castillo es el 20% de los guerreros
        castleDefence = Math.round(mWarriors * 0.2);
      }

    }

    // Mucha diferencia del atacante al defensor
    if ((sWarriors / mWarriors) > 6) {
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

    else if ((mWarriors / sWarriors) > 6) {
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
    } else {
      switch (number) {
        case 1:
          sWarriors /= values[0];
          break;
        case 2:
          sWarriors /= values[1];
          break;
        case 3:
          sWarriors /= values[2];
          break;
        case 8:
          sWarriors *= values[3];
          break;
        case 9:
          sWarriors *= values[4];
          break;
        case 10:
          sWarriors *= values[5];
          break;
      }
    }

    const attack = sWarriors - mWarriors;

    let victory;

    // Gana
    if (sWarriors > mWarriors) {
      victory = true;
      mWarriors = 0;
      sWarriors = attack;

      if (sWarriors < 1) {
        sWarriors = 1;
      }

      if (castleDefence > 0 && sWarriors / (mWarriors + castleDefence) < 4) {
        this.mLand().castle = false;
      }

      // Pierde
    } else if (sWarriors < mWarriors) {

      if (castleDefence > 0) {
        // Atacar primero el castillo
        sWarriors -= castleDefence;

        // Una vez roto el castillo quedan guerreros
        if (sWarriors >= 0) {
          this.mLand().castle = false;
        }
      }

      victory = false;
      mWarriors -= sWarriors;

      if (mWarriors < 1) {
        mWarriors = 1;
      }

      sWarriors = 0;
    }

    // Empate
    else {
      if (number == 4 || number == 5) {
        victory = true;
        sWarriors = 1;
        mWarriors = 0;

        if (castleDefence > 0) {
          this.mLand().castle = false;
        }

      } else if (number == 6 || number == 7) {
        victory = false;
        sWarriors = 0;
        mWarriors = 1;

        if (castleDefence > 0) {
          this.mLand().castle = false;
        }
      }
    }

    sWarriors = Math.round(sWarriors);
    mWarriors = Math.round(mWarriors);

    const attackResult = {
      'attacker': this.turnPlayer().name,
      'defender': this.findPlayerById(this.mLand().userId).name,
      'victory': victory,
      'castle': this.mLand().castle,
      'sWarriors': sWarriors,
      'mWarriors': mWarriors,
    };

    this.attackResult = attackResult;

    return attackResult;
  }

  // Abrir modal del ataque
  openAttackModal() {
    this.attackModal = this.modalService.open(this.attackModalContent, { size: 'sm', centered: true });
  }

  // Cerrar ataque
  closeAttackModal() {
    this.attackModal.close();
  }

  /*******************************************************************************************/
  /*                                       CASTILLOS                                         */
  /*******************************************************************************************/

  buyCastle() {
    if (this.turnPlayer().money >= 500) {
      this.turnPlayer().money -= 500;

      this.sLand().castle = true;
    }
  }

  /*******************************************************************************************/
  /*                                        TIENDA                                           */
  /*******************************************************************************************/

  // Abrir modal de la tienda
  openShopModal(shopModal) {
    this.shopModal = this.modalService.open(shopModal, { centered: true });
  }

  // Cerrar tienda
  closeShopModal() {
    this.shopModal.close();
  }

  showUpgrade(upgradeIndex) {
    if (upgradeIndex == 0 && this.turnPlayer().upgrades.warriors == false) {
      return true;
    } else if (upgradeIndex == 1 && this.turnPlayer().upgrades.castle == false) {
      return true;
    }

    return false;
  }

  showSelectedUpgrade(upgradeIndex) {
    if (this.sUpgradeIndex == upgradeIndex) {
      return true;
    }

    return false;
  }

  selectUpgrade(upgradeIndex) {
    if ((this.turnPlayer().money - this.upgrades[upgradeIndex].price) >= 0) {
      this.sUpgradeIndex = upgradeIndex;
    }
  }

  buyUpgrade() {
    this.turnPlayer().money -= this.sUpgrade().price;

    switch (this.sUpgradeIndex) {
      case 0:
        this.turnPlayer().upgrades.warriors = true;
        break;

      case 1:

        this.turnPlayer().upgrades.castle = true;
        break;
    }

    this.sUpgradeIndex = null;
  }

  /*******************************************************************************************/
  /*                                        VICTORIA                                         */
  /*******************************************************************************************/

  // Comprobar si el juego se ha terminado
  killPlayers() {
    if (this.game.roundNumber > this.players.length) {

      for (let i = 0; i < this.players.length; i++) {
        const landExist = this.boardLands.some(land => land.userId == this.players[i].id);

        if (!landExist && this.players[i].alive) {
          this.players[i].alive = false;
          this.players[i].died = this.game.roundNumber;
        }
      }

      this.countNotDied();
    }
  }

  // Contar cuantos jugadores están vivos
  countNotDied() {
    if (this.game.started == true) {
      this.count = 0;

      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].alive) {
          this.count++;
        }
      }

      if (this.count == 1) {
        this.openVictoryModal();
      }
    }
  }

  // Abrir modal de la victoria
  openVictoryModal() {
    this.victoryModal = this.modalService.open(this.victoryModalContent, { centered: true });
  }

  // Cerrar modal de la victoria
  closeVictoryModal() {
    this.victoryModal.close();
  }

  /*******************************************************************************************/
  /*                                         OTROS                                           */
  /*******************************************************************************************/

  // Color de la imagen
  warriorImgColor(player) {
    if (!this.game.started) {
      return 'warrior-black-sm.png';
    } else if (this.game.started && player.id != this.turnPlayer().id) {
      return 'warrior-black-sm.png';
    }

    return 'warrior-white-sm.png';
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

  mLand() {
    return this.boardLands[this.mLandIndex];
  }

  sUpgrade() {
    return this.upgrades[this.sUpgradeIndex];
  }
}


