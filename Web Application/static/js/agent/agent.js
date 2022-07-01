class Agent {
  constructor(id, position) {
    this.id = id;
    this.name = "robot";

    this.position = position;

    /* Calcolo le vere coordinate dell'oggetto */
    this.mapX = this.position.x * w;
    this.mapY = this.position.y * w;
  }

  show() {
    image(agentImage, this.mapX, this.mapY, w, w);
  }
  moveUp() {
    if (
      this.position.y - 1 >= 0 &&
      !cellsList[cellIndex(this.position.x, this.position.y)].walls[0]
    ) {
      updateAgentPosition(
        this.position.x.toString(),
        (this.position.y - 1).toString()
      );
    } else {
      console.log("Non posso andare su.");
    }
  }
  moveDown() {
    if (
      this.position.y + 1 < rows &&
      !cellsList[cellIndex(this.position.x, this.position.y)].walls[2]
    ) {
      updateAgentPosition(
        this.position.x.toString(),
        (this.position.y + 1).toString()
      );
    } else {
      console.log("Non posso andare giù.");
    }
  }

  moveRight() {
    if (
      this.position.x + 1 < cols &&
      !cellsList[cellIndex(this.position.x, this.position.y)].walls[1]
    ) {
      updateAgentPosition(
        (this.position.x + 1).toString(),
        this.position.y.toString()
      );
    } else {
      console.log("Non posso andare a destra.");
    }
  }

  moveLeft() {
    if (
      this.position.x - 1 >= 0 &&
      !cellsList[cellIndex(this.position.x, this.position.y)].walls[3]
    ) {
      updateAgentPosition(
        (this.position.x - 1).toString(),
        this.position.y.toString()
      );
    } else {
      console.log("Non posso andare a destra.");
    }
  }

  // FRAME
  /**
   * @param {dict} info Il robot si muove verso un GOAL.
   */
  arriving(info) {
    if (info["GOAL"] != undefined) {
      var nearestCell = findNearestCellToLocation(info["GOAL"]);
      if (!(nearestCell == -1)) {
        cellPath = astarAlg(
          cellsList[cellIndex(this.position.x, this.position.y)],
          nearestCell
        );
      } else {
        console.log("Non posso arrivare in quella zona.");
      }
    }
  }

  attaching(info) {}

  bringing(info) {}

  change_direction(info) {}

  change_operational_state(info) {}

  closure(info) {}

  /**
   * @param {*} info  Dizionario che può contenere THEME (entità)
   */
  manipulation(info) {
    if (info["THEME"] != undefined) {
      if (entityTakenByAgent == undefined) {
        var entity;

        for (var i = 0; i < itemsList.length; i++) {
          if (itemsList[i].id == info["THEME"]) {
            entity = itemsList[i];
          }
        }
        if (
          (cellsList[cellIndex(entity.position.x, entity.position.y)]
            .walls[0] == "false" &&
            this.position.x == entity.position.x &&
            this.position.y == entity.position.y - 1) ||
          (cellsList[cellIndex(entity.position.x, entity.position.y)]
            .walls[1] == "false" &&
            this.position.x == entity.position.x + 1 &&
            this.position.y == entity.position.y) ||
          (cellsList[cellIndex(entity.position.x, entity.position.y)]
            .walls[2] == "false" &&
            this.position.x == entity.position.x &&
            this.position.y == entity.position.y + 1) ||
          (cellsList[cellIndex(entity.position.x, entity.position.y)]
            .walls[3] == "false" &&
            this.position.x == entity.position.x - 1 &&
            this.position.y == entity.position.y)
        ) {
          // TO DO: cambiare posizione dell'entità presa in -1
          entityTakenByAgent = entity;
          updateEntityPosition(entity.id, -1, -1, 0);
        }
      }
    }
  }

  /**
   *
   * @param {dict} info Dizionario dove può essere presente GOAL
   */
  motion(info) {
    if (info["GOAL"] != undefined) {
      var nearestCell = findNearestCellToLocation(info["GOAL"]);
      if (!(nearestCell == -1)) {
        cellPath = astarAlg(
          cellsList[cellIndex(this.position.x, this.position.y)],
          nearestCell
        );
      } else {
        console.log("Non posso arrivare in quella zona.");
      }
    }
  }

  /**
   * @param {dict} info Dizionario che può contenere THEME e LOCATION_OF_CONFINEMENT
   */
  releasing(info) {
    if (entityTakenByAgent != undefined) {
      if (entityTakenByAgent.id != info["GOAL"]) {
        if (info["LOCATION_OF_CONFINEMENT"] != undefined) {
          // L'agente sa dove deve lasciare l'entità che ha in mano.
          var entityZoneToRelease;
          for (var i = 0; i < itemsList.length; i++) {
            if ((itemsList[i].id = info["LOCATION_OF_CONFINEMENT"])) {
              entityZoneToRelease = itemsList[i];
            }
          }
          if (entityZoneToRelease != undefined) {
            // L'agente deve portarlo vicino ad un'entità.
            var cellaVicinoEntità =
              findNearestCellToEntity(entityZoneToRelease);
            var path = astarAlg(
              cellsList[cellIndex(this.position.x, this.position.y)],
              cellaVicinoEntità
            );
            if (path.length == 1) {
              updateEntityPosition(
                entityTakenByAgent.id,
                path[0].x,
                path[0].y,
                0
              );
            } else {
              path.pop();
              cellPath.push(path);
              cellPath.push("RELEASING", info);
            }
          } else {
            // L'agente deve portarlo in una zona.
            var nearestCell = findNearestCellToLocation(
              info["LOCATION_OF_CONFINEMENT"]
            );
            if (!(nearestCell == -1)) {
              var path = astarAlg(
                cellsList[cellIndex(this.position.x, this.position.y)],
                nearestCell
              );
            }
            if (path.length == 1) {
              updateEntityPosition(
                entityTakenByAgent.id,
                path[0].x,
                path[0].y,
                0
              );
            } else {
              path.pop();
              cellPath.push(path);
              cellPath.push("RELEASING", info);
            }
          }
        } else {
          // L'agente non ha una location dove lasciare l'entità.
          // TO DO: LASCIARE L'OGGETTO IN UNA CELLA ADIACENTE POSSIBILE.
        }
      } else {
        console.log("Non ho quell'entità in mano.");
      }
    } else {
      console.log("Non ho niente in mano.");
    }
  }

  /**
   * @param {dict} info Dizionario che può contenere Source (zone) e THEME(entity)
   */
  taking(info) {
    // Taking = Motion + Manupulation
    if (info["SOURCE"] != undefined) {
      // Abbiamo informazioni della zona e dell'entità.
    } else {
      // Abbiamo solo informazioni sull'entità da prendere.
      // TO DO: check se possiamo muovere l'oggetto.
      var entSel;
      for (var i = 0; i < itemsList.length; i++) {
        if (itemsList[i].id == info["THEME"]) {
          entSel = itemsList[i];
        }
      }
      var nearCell = findNearestCellToEntity(entSel);
      cellPath = astarAlg(
        cellsList[cellIndex(this.position.x, this.position.y)],
        nearCell
      );
      cellPath.push(["MANIPULATION", info]);
    }
  }

  moveTo(x, y) {
    updateAgentPosition(x.toString(), y.toString());
    setTimeout(function () {
      getAgent();
    }, 100);
  }
}

/**
 * @param {Entity} entity
 * @returns la Cell più vicina all'entità.
 */
function findNearestCellToEntity(entity) {
  var tempCell = -1;
  var cellCounter = 1000000;
  var listNearCell = [];
  var cellOfEntity = cellsList[cellIndex(entity.position.x, entity.position.y)];

  if (entity.sizeX == 1 && entity.sizeY == 1) {
    if (cellOfEntity.walls[0] == "false") {
      listNearCell.push(
        cellsList[cellIndex(entity.position.x, entity.position.y - 1)]
      );
    }
    if (cellOfEntity.walls[1] == "false") {
      listNearCell.push(
        cellsList[cellIndex(entity.position.x + 1, entity.position.y)]
      );
    }
    if (cellOfEntity.walls[2] == "false") {
      listNearCell.push(
        cellsList[cellIndex(entity.position.x, entity.position.y + 1)]
      );
    }
    if (cellOfEntity.walls[3] == "false") {
      listNearCell.push(
        cellsList[cellIndex(entity.position.x - 1, entity.position.y)]
      );
    }
  }
  if (entity.sizeX > 1) {
    if (cellOfEntity.walls[3] == "false") {
      listNearCell.push(
        cellsList[cellIndex(entity.position.x - 1, entity.position.y)]
      );
    }
    for (var i = 0; i < entity.sizeX; i++) {
      //prende quello sopra alla cella a dx
      if (
        cellsList[cellIndex(entity.position.x + i, entity.position.y)]
          .walls[0] == "false"
      ) {
        listNearCell.push(
          cellsList[cellIndex(entity.position.x + i, entity.position.y - 1)]
        );
      }
      //prende sotto sopra alla cella a dx
      if (
        cellsList[cellIndex(entity.position.x + i, entity.position.y)]
          .walls[2] == "false"
      ) {
        listNearCell.push(
          cellsList[cellIndex(entity.position.x + i, entity.position.y + 1)]
        );
      }
    }
    if (
      cellsList[
        cellIndex(entity.position.x + entity.sizeX - 1, entity.position.y)
      ].walls[1] == "false"
    ) {
      listNearCell.push(
        cellsList[
          cellIndex(entity.position.x + entity.sizeX, entity.position.y)
        ]
      );
    }
  }
  if (entity.sizeY > 1) {
    if (cellOfEntity.walls[0] == "false") {
      listNearCell.push(
        cellsList[cellIndex(entity.position.x, entity.position.y - 1)]
      );
    }
    for (var i = 0; i < entity.sizeY; i++) {
      //prende quello dx alla cella sotto
      if (
        cellsList[cellIndex(entity.position.x, entity.position.y + i)]
          .walls[1] == "false"
      ) {
        listNearCell.push(
          cellsList[cellIndex(entity.position.x + 1, entity.position.y + i)]
        );
      }
      //prende sotto sx alla cella sotto
      if (
        cellsList[cellIndex(entity.position.x, entity.position.y + i)]
          .walls[3] == "false"
      ) {
        listNearCell.push(
          cellsList[cellIndex(entity.position.x - 1, entity.position.y + i)]
        );
      }
    }
    if (
      cellsList[
        cellIndex(entity.position.x, entity.position.y + entity.sizeY - 1)
      ].walls[2] == "false"
    ) {
      listNearCell.push(
        cellsList[
          cellIndex(entity.position.x, entity.position.y + entity.sizeY)
        ]
      );
    }
  }

  for (var i = 0; i < listNearCell.length; i++) {
    var path = astarAlg(
      cellsList[cellIndex(agent.position.x, agent.position.y)],
      listNearCell[i]
    );
    if (path != -1 && path.length < cellCounter) {
      tempCell = listNearCell[i];
      cellCounter = path.length;
    }
  }

  return tempCell;
}

function findNearestCellToLocation(location) {
  var cellCounter = 100000000;
  var tempCell = -1;
  for (var i = 0; i < cellsList.length; i++) {
    if (cellsList[i].zone == location) {
      var path = astarAlg(
        cellsList[cellIndex(agent.position.x, agent.position.y)],
        cellsList[i]
      );
      if (path.length < cellCounter) {
        cellCounter = path.length;
        tempCell = cellsList[i];
      }
    }
  }
  return tempCell;
}
