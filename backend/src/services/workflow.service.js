/**
 * Document State Machine Workflow Service
 *
 * Valid Transitions:
 * PENDING → UPLOADED (upload)
 * UPLOADED → UNDER_REVIEW (start review)
 * UNDER_REVIEW → APPROVED (approve)
 * UNDER_REVIEW → CORRECTION_REQUIRED (request correction)
 * CORRECTION_REQUIRED → UPLOADED (re-upload)
 */

const DOCUMENT_STATES = {
  PENDING: 'PENDING',
  UPLOADED: 'UPLOADED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  CORRECTION_REQUIRED: 'CORRECTION_REQUIRED'
};

const VALID_TRANSITIONS = {
  [DOCUMENT_STATES.PENDING]: [DOCUMENT_STATES.UPLOADED],
  [DOCUMENT_STATES.UPLOADED]: [DOCUMENT_STATES.UNDER_REVIEW],
  [DOCUMENT_STATES.UNDER_REVIEW]: [DOCUMENT_STATES.APPROVED, DOCUMENT_STATES.CORRECTION_REQUIRED],
  [DOCUMENT_STATES.CORRECTION_REQUIRED]: [DOCUMENT_STATES.UPLOADED],
  [DOCUMENT_STATES.APPROVED]: [] // Terminal state, no further transitions allowed
};

class WorkflowService {
  static getStates() {
    return DOCUMENT_STATES;
  }

  static canTransition(currentStatus, targetStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  static validateTransition(currentStatus, targetStatus, actionName = 'action') {
    if (!this.canTransition(currentStatus, targetStatus)) {
      const allowed = VALID_TRANSITIONS[currentStatus] || [];
      const allowedStr = allowed.length ? allowed.join(', ') : 'none (terminal state)';
      const error = new Error(
        `Invalid workflow transition for ${actionName}: Cannot change status from '${currentStatus}' to '${targetStatus}'. Allowed target states: [${allowedStr}].`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  static canUpload(currentStatus) {
    return currentStatus === DOCUMENT_STATES.PENDING || currentStatus === DOCUMENT_STATES.CORRECTION_REQUIRED;
  }

  static canStartReview(currentStatus) {
    return currentStatus === DOCUMENT_STATES.UPLOADED;
  }

  static canApprove(currentStatus) {
    return currentStatus === DOCUMENT_STATES.UNDER_REVIEW;
  }

  static canRequestCorrection(currentStatus) {
    return currentStatus === DOCUMENT_STATES.UNDER_REVIEW;
  }
}

module.exports = {
  WorkflowService,
  DOCUMENT_STATES,
  VALID_TRANSITIONS
};
