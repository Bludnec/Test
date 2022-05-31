class Entity {
  constructor(id, name, entClass, position) {
    this.id = id;
    this.name = name;
    this.entClass = entClass;

    this.position = position;

    /* Real coordinates on the canvas */
    this.mapX = this.position.x * w;
    this.mapY = this.position.y * w;

    /* Abilities */
    this.ability = [];

    this.lexical_references = [];
  }
  show() {
    var img = eval(`${this.entClass}Image`);
    image(img, this.mapX, this.mapY, w, w);
  }
  hasAbility(name) {
    for (var i = 0; i < this.ability.length; i++) {
      if (this.ability[i] == name) {
        return true;
      }
    }
  }
}
