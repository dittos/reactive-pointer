import { Observable } from 'rxjs/Observable';
import { map as observableMap } from 'rxjs/operator/map';
import { Subject } from 'rxjs/Subject';

export interface Ptr<T> {
  get(): T;
  map<U>(mapper: (value: T) => U): Ptr<U>;
}

export interface MutablePtr<T> extends Ptr<T> {
  set(value: T): void;
  changes(): Observable<T>;

  mapMut<U>(
    mapper: (value: T) => U,
    inverseMapper: (value: U) => T
  ): MutablePtr<U>;
}

class ScalarPtr<T> implements MutablePtr<T> {
  private _subject: Subject<T> = new Subject();

  constructor(private _value: T) {}

  get(): T {
    return this._value;
  }

  set(value: T): void {
    this._value = value;
    this._subject.next(value);
  }

  changes(): Observable<T> {
    return this._subject;
  }

  map<U>(mapper: (value: T) => U): Ptr<U> {
    return new MapPtr(this, mapper);
  }

  mapMut<U>(
    mapper: (value: T) => U,
    inverseMapper: (value: U) => T
  ): MutablePtr<U> {
    return new MapMutPtr(this, mapper, inverseMapper);
  }
}

class MapPtr<T, U> implements Ptr<U> {
  constructor(
    private _source: Ptr<T>,
    private _mapper: (value: T) => U
  ) {}

  get(): U {
    return this._mapper(this._source.get());
  }

  map<V>(mapper: (value: U) => V): Ptr<V> {
    return new MapPtr(this, mapper);
  }
}

class MapMutPtr<T, U> implements MutablePtr<U> {
  constructor(
    private _source: MutablePtr<T>,
    private _mapper: (value: T) => U,
    private _inverseMapper: (value: U) => T
  ) {}

  get(): U {
    return this._mapper(this._source.get());
  }

  map<V>(mapper: (value: U) => V): Ptr<V> {
    return new MapPtr(this, mapper);
  }

  set(value: U): void {
    this._source.set(this._inverseMapper(value));
  }

  mapMut<V>(
    mapper: (value: U) => V,
    inverseMapper: (value: V) => U
  ): MutablePtr<V> {
    return new MapMutPtr(this, mapper, inverseMapper);
  }

  changes(): Observable<U> {
    return observableMap.call(this._mapper, this._source.changes());
  }
}

export function ptrOf<T>(value: T): MutablePtr<T> {
  return new ScalarPtr(value);
}
