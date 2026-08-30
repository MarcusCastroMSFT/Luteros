import assert from 'node:assert/strict';
import test from 'node:test';
import { getCoursePath } from './course-paths';

test('builds the course detail path from its slug', () => {
  assert.equal(getCoursePath('cursomarcus'), '/courses/cursomarcus');
});