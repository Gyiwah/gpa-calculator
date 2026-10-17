const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { averageGradePoints, getClassOfHonour } = require('../gpa-core.js');

describe('averageGradePoints', () => {
  it('calculates a credit-weighted GPA across courses', () => {
    const courses = [
      { grade: 'A', credits: 4 },
      { grade: 'B', credits: 2 }
    ];

    assert.equal(averageGradePoints(courses), 22 / 6);
  });

  it('returns null when there are no credit hours', () => {
    assert.equal(averageGradePoints([]), null);
    assert.equal(averageGradePoints([{ grade: 'A', credits: 0 }]), null);
  });

  it('includes zero-point grades in the credit-weighted average', () => {
    assert.equal(averageGradePoints([
      { grade: 'A', credits: 3 },
      { grade: 'E', credits: 3 }
    ]), 2);
  });
});

describe('getClassOfHonour', () => {
  it('classifies each honours threshold and pass range', () => {
    assert.equal(getClassOfHonour(3.5), 'First Class Honours');
    assert.equal(getClassOfHonour(3.49), 'Second Class Honours (Upper Division)');
    assert.equal(getClassOfHonour(3), 'Second Class Honours (Upper Division)');
    assert.equal(getClassOfHonour(2.99), 'Second Class Honours (Lower Division)');
    assert.equal(getClassOfHonour(2.5), 'Second Class Honours (Lower Division)');
    assert.equal(getClassOfHonour(2.49), 'Third Class Honours');
    assert.equal(getClassOfHonour(2), 'Third Class Honours');
    assert.equal(getClassOfHonour(1.99), 'Pass');
    assert.equal(getClassOfHonour(0), 'Pass');
  });
});
