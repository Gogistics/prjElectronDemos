module.exports = {
    check_account_name: function(arg_account_name) {
        // check if an argument given
        if(arguments.length === 0){
            throw new Error('Please give pass an argument');
            return false;
        }else if(typeof arg_account_name !== 'string' || arg_account_name instanceof String){
            throw new Error('Account name should be in stirng type');
            return false;
        }
        return arg_account_name;
    },
       
    check_pwd: function(arg_pwd) {
        // check if an argument given
        if(arguments.length === 0){
            throw new Error('Please give pass an argument');
            return false;
        }
        return "Hola";
    }
};