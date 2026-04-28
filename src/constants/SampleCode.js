export const SAMPLE_CODE = `class Shape {
  color = "red";
  getArea() { return 0; }
  display() { console.log('Displaying...'); }
}

class Rectangle extends Shape {
  width = 10;
  height = 20;
  getArea() { return this.width * this.height; }
}

class Circle extends Shape {
  radius = 5;
  getArea() { return Math.PI * this.radius ** 2; }
  getRadius() { return this.radius; }
}

class DrawingApp {
  constructor() {
    this.mainShape = new Circle();
  }
}

class Logger {
  log(msg) { console.log(msg); }
}`;