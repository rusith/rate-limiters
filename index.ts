import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json());


class Node<T> {
  constructor(public val:T) {}
  public next: Node<T> | null = null;
}

class Queue<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;

  public add(val: T) {
    const newNode = new Node(val)
    if (this.head) {
      this.head.next = newNode;
      this.head = newNode;
    } else {
      this.head = newNode
      this.tail = newNode
    }
  }

  public get(): T | null {
    if (!this.tail) {
      return null
    };
    const val = this.tail.val;
    this.tail = this.tail.next;
    if (!this.tail) {
      this.head = null;
    }
    return val;
  }
}


class RateLimitter {
  private queue: Queue<{ req: express.Request, res: express.Response, next: express.NextFunction}> = new Queue()

  addRequest(req: express.Request, res: express.Response, next: express.NextFunction){
    console.log('Adding request')
    this.queue.add({ req, res, next })
  }

  private processNext() {
    const next = this.queue.get()
    if (next) {
      console.log('Processing request')
      next.next()
    }
  }

  start() {
    setInterval(() => this.processNext(), 500)
  }
}



const rateLimitter = new RateLimitter();

function handler(req: express.Request, res: express.Response, next: express.NextFunction) {
  rateLimitter.addRequest(req, res, next)
}

app.use(handler)

app.get('/', (req, res)=> res.send("Hello from the API"));
app.listen(3000, () => {
  rateLimitter.start();
  console.log("Listening on port 3000")
})
