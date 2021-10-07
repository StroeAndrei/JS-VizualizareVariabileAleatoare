window.onload = init;

function init() {

	/**
	 * Clasa pentru distributia normala
	 */
		
	class Normal
	{
		/**
		 * Functie pentru calcularea densitatii de repartitie in cazul
		 * variabilei aleatoare X cu repartitia normala N(mu, sigma)
		 */

		densitateaDeRepartitieCazulGeneral(x, mu, sigma) {
			return ( (1 / (sigma * (Math.sqrt(2 * Math.PI)))) * (Math.pow(Math.E, -(Math.pow((x - mu), 2) / (2 * Math.pow(sigma, 2))))) );
		}

		/**
		 * Functie pentru calcularea densitatii de repartitie in cazul
		 * variabilei aleatoare X cu repartitia normala redusa 
		 * N(0, 1)
		 */

		densitateaDeRepartitieCazulRedus(x) {
			return ( (1 / (Math.sqrt(2 * Math.PI))) * (Math.pow(Math.E, (Math.pow(x, 2) / 2))) );
		}

		/**
		 * Metoda ce implementeaza algoritmul pentru generarea unei variabile
		 * aleatoare N(0, 1) folosind Teorema Limita Centrala 
		 */

		static genereazaVariabilaNormala01() {
			// Lista pentru numere aleatoare U1...U12
			let U = [];

			// Se genereaza cu RNG 12 numere aleatoare U1...U12
			// uniforme si independente pe (0, 1)
			for(let i = 0; i < 12; i++) {
				// Atasam numerele in lista
				U.push(Math.random());
			}

			// Iesire Z = U1+...+U12 - 6 
			return (U.reduce((a, b) => a + b, 0) - 6);
		}
	}

	class Lognormal
	{
		constructor(m, s) {
			this.m = m;
			this.s = s;
		}

		get getM() {
			return this.m;
		}

		get getS() {
			return this.s;
		}

		// Metoda folosita pentru calcularea mediei miu
		calculeazaMediaMiu(m, s) {
			return ( Math.log(m) - (1/2) * Math.log((s / Math.pow(m, 2)) + 1) );
		}

		// Metoda folosita pentru calcularea dispersiei sigma
		calculeazaDispersiaSigmaPatrat(m, s) {
			return ( Math.log((s / Math.pow(m, 2)) + 1) );
		}

		// Metoda ce implementeaza algoritmul pentru generarea variabilei lognormale
		genereazaVariabilaLognormala() {
			// Calculam media miu si dispersia sigma
			let mu = this.calculeazaMediaMiu(this.getM, this.getS);
			let sigma = this.calculeazaDispersiaSigmaPatrat(this.getM, this.getS);
			// Generam Z cu distributia normala N(0,1)
			let Z = Normal.genereazaVariabilaNormala01();
			// Calculam X (sigma = sqrt(sigma patrat))
			let X = mu + (Z * Math.sqrt(sigma));
			// Calculam si intoarcem pe Y cu distributia lognormala (miu, sigma)
			return ( Math.pow(Math.E, X) );
		}
	}
	
	class Bernoulli 
	{
		// Metoda ce implementeaza algoritmul pentru generarea variabilei Bernoulli
		genereazaVariabilaBernoulli(p) {
			// Generam cu RNG o variabila U
			let U = Math.random();

			// Daca U este mai mare ca probabilitatea p (0, 1)
			if(U > p) {
				// Intoarcem 0
				return 0;
			} else {
				// Altfel intoarcem 1
				return 1;
			}
		}
	}

	class Binomiala
	{
		/**
		 * Metoda de generare a variabilei binomiale bazata 
		 * pe variabila normala generata cu TLC
		 */
		genereazaVariabilaBinomPrinNorm(n, p) {
			// Se genereaza W cu distributia normala N(0,1)
			let W = Normal.genereazaVariabilaNormala01();
			let q = 1 - p;

			// Intoarcem variabila X
			return Math.round(( (n * p) + W * Math.sqrt(n * p * q) ));
		}

		/**
		 * Metoda de generare a variabilei binomiale 
		 * bazata pe variabila Bernoulli
		 */

		genereazaVariabilaBinomialaPrinBern(n, p) {
			let i = 1;
			let X = 0;
			let Z;
			let bern = new Bernoulli();

			while(true) {
				// Se genereaza Zi cu distributia Bernoulli(p)
				Z = bern.genereazaVariabilaBernoulli(p);
				X += Z;
				// Daca i = n STOP
				if(i == n) break; 
				// Altfel i = i + 1
				i++;
			}

			// Intoarcem variabila aleatoare X
			return X;
		}

	}

	class Validator
	{
		static genereazaMediaEmpirica(listaVarAleat) {
			// Variabila pentru suma variabilelor aleatoare
			let sumaVar = 0;

			// Efectuam suma variabilelor aleatoare
			for(let i = 0; i < listaVarAleat.length; i++) {
				sumaVar += listaVarAleat[i];
			}

			// Intoarcem media empirica
			return (sumaVar / listaVarAleat.length);
		}

		static genereazaDispersiaEmpirica(listaVarAleat) {
			// Obtinem media empirica din metoda precizata
			let mediaEmp = this.genereazaMediaEmpirica(listaVarAleat);
			// Variabila pentru suma patratelor variabilelor aleatoare
			let sumaPatratelor = 0;

			// Efectuam suma patratelor variabilelor aleatoare
			for(let i = 0; i < listaVarAleat.length; i++) {
				sumaPatratelor += Math.pow(listaVarAleat[i], 2);
			}

			// Intoarcem dispersia empirica
			return (sumaPatratelor / listaVarAleat.length) - Math.pow(mediaEmp, 2);
		}
	}
	

	///////////////////////
	// Interfata Grafica //
	///////////////////////

	// Elementele necesare pentru interactiune din HTML
	var generateNormal = document.getElementById("generate-normal");
	var generateLognormal = document.getElementById("generate-lognormal");
	var generateBernoulli = document.getElementById("generate-bernoulli");
	var generateBinom1 = document.getElementById("generate-binom1");
	var generateBinom2 = document.getElementById("generate-binom2");
	var meanSection = document.getElementById("mean");
	var standardDevSection = document.getElementById("standardDev");

	// Lista variabilelor generate
	var listOfVars = [];

	// Generam variabilele normale
	generateNormal.addEventListener("click", function() {
		let varSection = document.getElementById("values-list");
		let totalVars = document.getElementById("numberOfVariables").value;

		// Valorile introduse trebuie sa se incadreze in limitele stabilite
		if(totalVars >= 1 && totalVars <= 30000) {
			listOfVars = [];

			// Generam n variabile aleatoare pe care le inseram in lista
			for(let i = 0; i < totalVars; i++) {
				let getNormalVar = Normal.genereazaVariabilaNormala01();
				listOfVars.push(getNormalVar);
			}

			// Atasam variabilele generate in sectiunea din HTML pentru valori
			varSection.textContent = '';
			listOfVars.forEach(function(item) {
				let makeParagraph = document.createElement("p");
				let textValue = document.createTextNode(item);
				makeParagraph.appendChild(textValue);
				varSection.appendChild(makeParagraph);
			})

			// Afisam in HTML media si dispersia empirica
			meanSection.innerHTML = (Validator.genereazaMediaEmpirica(listOfVars)).toFixed(5);
			standardDevSection.innerHTML = (Validator.genereazaDispersiaEmpirica(listOfVars)).toFixed(5);

			// Generam histograma
			genereazaHistograma(totalVars, "normala");
		} else {
			// Daca valorile nu se incadreaza in limitele stabilite afisam mesaje de eroare
			alert("Numarul de variabile trebuie sa fie intre 1 si 30000.");
		}
	});

	// Generam variabile lognormale
	generateLognormal.addEventListener("click", function() {
		let varSection = document.getElementById("values-list");
		let totalVars = document.getElementById("numberOfVariables").value;
		
		if(totalVars >= 1 && totalVars <= 30000) {
			listOfVars = [];
			let lognormal = new Lognormal(2, 3);

			for(let i = 0; i < totalVars; i++) {
				listOfVars.push(lognormal.genereazaVariabilaLognormala());
			}
	
			varSection.textContent = '';
			listOfVars.forEach(function(item) {
				let makeParagraph = document.createElement("p");
				let textValue = document.createTextNode(item);
				makeParagraph.appendChild(textValue);
				varSection.appendChild(makeParagraph);
			})

			meanSection.innerHTML = (Validator.genereazaMediaEmpirica(listOfVars)).toFixed(5);
			standardDevSection.innerHTML = (Validator.genereazaDispersiaEmpirica(listOfVars)).toFixed(5);

			genereazaHistograma(totalVars, "lognormala");
		} else {
			alert("Numarul de variabile trebuie sa fie intre 1 si 30000.");
		}
	});

	// Generam variabile Bernoulli
	generateBernoulli.addEventListener("click", function() {
		let varSection = document.getElementById("values-list");
		let probBerni = document.getElementById("probForBernoulli").value;
		let totalVars = document.getElementById("numberOfBernoulliVars").value;
		
		if((probBerni >= 0 && probBerni <= 1) && (totalVars >= 1 && totalVars <= 30000)) {
			let bernoulli = new Bernoulli();
			listOfVars = [];

			for(let i = 0; i < totalVars; i++) {
				listOfVars.push(bernoulli.genereazaVariabilaBernoulli(probBerni));
			}

			varSection.textContent = '';
			listOfVars.forEach(function(item) {
				let makeParagraph = document.createElement("p");
				let textValue = document.createTextNode(item);
				makeParagraph.appendChild(textValue);
				varSection.appendChild(makeParagraph);
			})

			meanSection.innerHTML = (Validator.genereazaMediaEmpirica(listOfVars)).toFixed(5);
			standardDevSection.innerHTML = (Validator.genereazaDispersiaEmpirica(listOfVars)).toFixed(5);

			genereazaHistograma(totalVars, "bernoulli");
		} else if(probBerni < 0 || probBerni > 1) {
			alert("Probabilitatea trebuie sa fie intre 0 si 1.");
		} else if(totalVars < 1 || totalVars > 30000) {
			alert("Numarul de variabile trebuie sa fie intre 1 si 30000.");
		}
	});

	// Generam variabile binomiale - folosesc variabile normale
	generateBinom1.addEventListener("click", function() {
		let varSection = document.getElementById("values-list");
		let probBinom = document.getElementById("probBinom").value;
		let numberOfSamples = document.getElementById("numberOfNSampl").value;
		let numberOfBinomVars = document.getElementById("numberOfBinomVars").value;

		if((probBinom >= 0 && probBinom <= 1) && (probBinom !== "") &&
			(numberOfSamples >= 1 && numberOfSamples <= 500) &&
			(numberOfBinomVars >= 1 && numberOfBinomVars <= 30000)) {

			listOfVars = [];
			let binom = new Binomiala();

			for(let i = 0; i < numberOfBinomVars; i++) {
				listOfVars.push(binom.genereazaVariabilaBinomPrinNorm(numberOfSamples, probBinom));
			}

			varSection.textContent = '';
			listOfVars.forEach(function(item) {
				let makeParagraph = document.createElement("p");
				let textValue = document.createTextNode(item);
				makeParagraph.appendChild(textValue);
				varSection.appendChild(makeParagraph);
			});

			meanSection.innerHTML = (Validator.genereazaMediaEmpirica(listOfVars)).toFixed(5);
			standardDevSection.innerHTML = (Validator.genereazaDispersiaEmpirica(listOfVars)).toFixed(5);

			genereazaHistograma(numberOfBinomVars, "binomialaV1");
		} else if(probBinom < 0 || probBinom > 1 || probBinom === "") {
			alert("Probabilitatea trebuie sa fie intre 0 si 1.");
		} else if(numberOfSamples < 1 || numberOfSamples > 500) {
			alert("Numarul de probe n trebuie sa fie intre 1 si 500");
		} else if(numberOfBinomVars < 1 || numberOfBinomVars > 30000) {
			alert("Numarul de variabile trebuie sa fie intre 1 si 30000.");
		}
	});

	// Generam variabile binomiale - folosesc variabile bernoulli
	generateBinom2.addEventListener("click", function() {
		let varSection = document.getElementById("values-list");

		let probBinom = document.getElementById("probBinom").value;
		let numberOfSamples = document.getElementById("numberOfNSampl").value;
		let numberOfBinomVars = document.getElementById("numberOfBinomVars").value;

		if((probBinom >= 0 && probBinom <= 1) && (probBinom !== "") &&
			(numberOfSamples >= 1 && numberOfSamples <= 500) &&
			(numberOfBinomVars >= 1 && numberOfBinomVars <= 30000)) {
			
			listOfVars = [];
			let binom = new Binomiala();

			for(let i = 0; i < numberOfBinomVars; i++) {
				listOfVars.push(binom.genereazaVariabilaBinomialaPrinBern(numberOfSamples, probBinom));
			}

			varSection.textContent = '';
			listOfVars.forEach(function(item) {
				let makeParagraph = document.createElement("p");
				let textValue = document.createTextNode(item);
				makeParagraph.appendChild(textValue);
				varSection.appendChild(makeParagraph);
			});

			meanSection.innerHTML = (Validator.genereazaMediaEmpirica(listOfVars)).toFixed(5);
			standardDevSection.innerHTML = (Validator.genereazaDispersiaEmpirica(listOfVars)).toFixed(5);

			genereazaHistograma(numberOfBinomVars, "binomialaV2");
		} else if(probBinom < 0 || probBinom > 1 || probBinom === "") {
			alert("Probabilitatea trebuie sa fie intre 0 si 1.");
		} else if(numberOfSamples < 1 || numberOfSamples > 500) {
			alert("Numarul de probe n trebuie sa fie intre 1 si 500");
		} else if(numberOfBinomVars < 1 || numberOfBinomVars > 30000) {
			alert("Numarul de variabile trebuie sa fie intre 1 si 30000.");
		}
	});

	// Functie folosita pentru generarea histogramei
	function genereazaHistograma(iter, varType) {
		var x = [];

		// Preluam in x variabilele aleatoare din listOfVars pentru mapare
		for (var i = 0; i < iter; i++) {
			x[i] = listOfVars[i];
		}

		// Modificam reprezentarea grafica a variabilei lognormale pentru claritate
		if(varType == "lognormala") {
			var layout = {
				xaxis: {
					range: [-2, 15],
					tickmode: 'linear',
					tick0: -1,
					dtick: 0.5,
				},
	
				yaxis: {
					autorange: true,
				}
			}
		} else {
			var layout = {
				xaxis: {
					autorange: true,
				},
	
				yaxis: {
					autorange: true,
				}
			}
		}

		// Setari de baza pentru histograma
		var trace = {
			x: x,
			type: 'histogram',
			marker: {
				color: 'black',
				line: {
					color: 'white',
					width: 0.1
				}
			}
		};

		// Construim un nou grafic
		var data = [trace];
		Plotly.newPlot('graph', data, layout);
	}

	
}