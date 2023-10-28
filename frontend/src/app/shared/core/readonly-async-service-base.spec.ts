import { getUpdatedOldObj } from './readonly-async-service-base';
describe('ReadonlyAsyncServiceBase', () => {
  describe('getUpdatedOldObj', () => {
    it('Two primitive obj', () => {
      const oldObj = 1;
      const newObj = 2;

      getUpdatedOldObj(oldObj, newObj, new Set());

      expect(oldObj).toEqual(1);
    });

    it('Two objs with only id', () => {
      const oldObj: any = { id: '1' };
      const newObj = { id: '2' };

      getUpdatedOldObj(oldObj, newObj, new Set());

      expect(oldObj).toEqual({ id: '2' });
    });

    it('Two objs with plain attributes', () => {
      const oldObj: any = { id: '1', str: '111', num: 111, shouldDelete: 'abc' };
      const newObj = { id: '1', str: '321', num: 321, bool: true };

      getUpdatedOldObj(oldObj, newObj, new Set());

      expect(oldObj).toEqual({ id: '1', str: '321', num: 321, bool: true });
    });

    it('Two objs with nested objs', () => {
      const complexRef = { str: '111', num: 111 };

      const oldObj: any = { id: '1', complex: complexRef };
      const newObj = { id: '1', complex: { str: '321', num: 321 } };

      getUpdatedOldObj(oldObj, newObj, new Set());

      expect(oldObj).toEqual({ id: '1', complex: { str: '321', num: 321 } });
      expect(complexRef).toEqual({ str: '321', num: 321 });
    });

    it('Two objs with number arrays', () => {
      const arrRef = [321, 123];

      const oldObj: any = { id: '1', arr: arrRef };
      const newObj = { id: '1', arr: [321, 123, 456] };

      getUpdatedOldObj(oldObj, newObj, new Set());

      expect(oldObj).toEqual({ id: '1', arr: [321, 123, 456] });
      expect(arrRef).toEqual([321, 123, 456]);
    });

    it('Two objs with obj arrays', () => {
      const arrItem1 = { num: 321, str: '321' };
      const arrItem2 = { num: 123, str: '123' };
      const arrRef = [arrItem1, arrItem2];

      const oldObj: any = { id: '1', arr: arrRef };
      const newObj = {
        id: '1',
        arr: [
          { num: 321, str: '321' },
          { num: 123, str: '123' },
          { num: 213, str: '213' },
        ],
      };

      getUpdatedOldObj(oldObj, newObj, new Set());

      expect(oldObj).toEqual({
        id: '1',
        arr: [
          { num: 321, str: '321' },
          { num: 123, str: '123' },
          { num: 213, str: '213' },
        ],
      });
      expect(arrRef).toEqual([
        { num: 321, str: '321' },
        { num: 123, str: '123' },
        { num: 213, str: '213' },
      ]);
      expect(arrItem1).toBe(oldObj.arr[0]);
      expect(arrItem2).toBe(oldObj.arr[1]);
    });

    it('Two objs with different order obj arrays', () => {
      const arrItem1 = { num: 321, str: '321' };
      const arrItem2 = { num: 123, str: '123' };
      const arrRef = [arrItem1, arrItem2];

      const oldObj: any = { id: '1', arr: arrRef };
      const newObj = {
        id: '1',
        arr: [
          { num: 123, str: '123' },
          { num: 321, str: '321' },
          { num: 213, str: '213' },
        ],
      };

      getUpdatedOldObj(oldObj, newObj, new Set());

      expect(oldObj).toEqual({
        id: '1',
        arr: [
          { num: 123, str: '123' },
          { num: 321, str: '321' },
          { num: 213, str: '213' },
        ],
      });
      expect(arrRef).toEqual([
        { num: 123, str: '123' },
        { num: 321, str: '321' },
        { num: 213, str: '213' },
      ]);
      expect(arrItem2).toBe(oldObj.arr[0]);
      expect(arrItem1).toBe(oldObj.arr[1]);
    });

    fit('Two objs with the same nested obj', () => {
      const personalBoard01 = {
        id: 'personalBoard01',
        name: 'personalBoard01',
        pinnedBoardList: [],
      };
      const oldBoard01 = {
        id: 'board01',
        name: 'board01',
        responder: personalBoard01,
        pinnedBoardList: [],
      };

      personalBoard01.pinnedBoardList.push(oldBoard01);

      const newBoard01 = {
        id: 'board01',
        name: 'board01 new',
        responder: personalBoard01,
        pinnedBoardList: [],
      };

      getUpdatedOldObj(oldBoard01, newBoard01, []);

      expect(oldBoard01).toEqual({
        id: 'board01',
        name: 'board01 new',
        responder: {
          id: 'personalBoard01',
          name: 'personalBoard01',
          pinnedBoardList: [oldBoard01],
        },
        pinnedBoardList: [],
      });

      expect(personalBoard01).toEqual({
        id: 'personalBoard01',
        name: 'personalBoard01',
        pinnedBoardList: [oldBoard01],
      });

      expect(personalBoard01).toBe(oldBoard01.responder);
    });
  });
});
