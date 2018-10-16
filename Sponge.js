// library used to emulate uint64_t numbers
var Long  = require('long');
const RHO = 1


//Blake2b IV array
const BLAKE2B_IV = [
	new Long(0xf3bcc908, 0x6a09e667, true),
	new Long(0x84caa73b, 0xbb67ae85, true),
	new Long(0xfe94f82b, 0x3c6ef372, true),
	new Long(0x5f1d36f1, 0xa54ff53a, true),
	new Long(0xade682d1, 0x510e527f, true),
	new Long(0x2b3e6c1f, 0x9b05688c, true),
	new Long(0xfb41bd6b, 0x1f83d9ab, true),
	new Long(0x137e2179, 0x5be0cd19, true),
]

//Blake2b rotation
function rotr64(w,c){

	var a = w.shr_u(c);
	var b = w.shr_u(64 - c);

	return a.or(b);
}

//Blake2b's G function
function blake2bG(state,a,b,c,d){
	state[a] = state[a].add(state[b]);
	state[d] = rotr64(state[d].xor(state[a]), 32);
	state[c] = state[c].add(d);
	state[b] = rotr64(state[b].xor(state[c]), 24);
	state[a] = state[a].add(state[b]);
	state[d] = rotr64(state[d].xor(state[a]), 16);
	state[c] = state[c].add(state[d]);
	state[d] = rotr64(state[b].xor(state[c]), 63);
	return state;
}

//One Round of the Blake2b's compression function
function roundLyra(state){
    state = blake2bG(state, 0, 4,  8, 12);
    state = blake2bG(state, 1, 5,  9, 13);
    state = blake2bG(state, 2, 6, 10, 14);
    state = blake2bG(state, 3, 7, 11, 15);
    state = blake2bG(state, 0, 5, 10, 15);
    state = blake2bG(state, 1, 6, 11, 12);
    state = blake2bG(state, 2, 7,  8, 13);
    state = blake2bG(state, 3, 4,  9, 14);
    return state;
}

//Executes G function, with all 12 rounds for Blake2b
//@param state 		A 1024 bit (16 times of our custom long) to be processed by Blake2b
function spongeLyra(state){
	var i;
	for (i = 0; i < 12; i++){
		roundLyra(state);
	}
	return state;
}

//Executes a reduced version G function, with 1 round for Blake2b
//@param state 		A 1024 bit (16 times of our custom long) to be processed by Blake2b
function reducedSpongeLyra(state){
	for (i = 0; i < RHO; i++){
		roundLyra(state);
	}
	return state;
}

//Initializes the Sponge's State. The first 512 bits are set to zeros and the remainder 
// receive Blake2b's IV as per Blake2b's specification. 
// 
// @param state         The 1024-bit array to be initialized
function initState(state){
	//Set first 512 bits to zeros (8 * 64bit numbers)
 	for(var i = 0; i < 8; i++){
 		state.push(Long.UZERO);
 	}
	//Set next 8 to Blake2b's IV
	for (var i = 0; i < 8; i++){
		state.push(BLAKE2B_IV[i]);
	}
	return state;
}

module.exports = {
	initState: initState,
	roundLyra: roundLyra
}