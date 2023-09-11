const ClientError = require("./ClientError");

class DatabaseError extends ClientError {
    constructor(message, originalError) {
      super(message);
      this.name = this.constructor.name;
      this.originalError = originalError; 
    }
  }
  
  module.exports = DatabaseError;
  