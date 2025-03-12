//ciasteczka
if (!document.cookie.includes("wygrane=")) document.cookie = "wygrane=0; max-age=6048000; path=/";
if (!document.cookie.includes("rozegrane=")) document.cookie = "rozegrane=0; max-age=604800; path=/";
if (!document.cookie.includes("biezacy_streak=")) document.cookie = "biezacy_streak=0; max-age=604800; path=/";
if (!document.cookie.includes("najlepszy_streak=")) document.cookie = "najlepszy_streak=0; max-age=604800; path=/";

let ciastka = document.cookie.split("; "); // rozbicie na poszczególne ciastka
let wygrane = ciastka.find(row => row.startsWith("wygrane=")); // wyszzukanie odpowiedniego ciastka
wygrane = wygrane.split("=")[1]; // wartosc ciasteczka

let rozegrane = ciastka.find(row => row.startsWith("rozegrane="));
rozegrane = rozegrane.split("=")[1];

let biezacy_streak = ciastka.find(row => row.startsWith("biezacy_streak="));
biezacy_streak = biezacy_streak.split("=")[1];

let najlepszy_streak = ciastka.find(row => row.startsWith("najlepszy_streak="));
najlepszy_streak = najlepszy_streak.split("=")[1];

statystykiAktualizacjia();

class Karta{
    constructor(kolor, liczba = null, dragable = false){
        this.kolor = kolor;
        this.liczba = liczba;
        this.dragable = dragable;
    }
 
 
};
 
class Stak{
    constructor(type = "normal", tab = []){
        this.type = type; // normal, holder, ending
        this.tab = tab;
    }
};
 
const tablica = document.getElementById("tablica");
const holdery = document.getElementById("holdery");
const endingi = document.getElementById("endingi");
 
var plansza = [];
var holders = [];
var endings = [];
 
const tablicaWygrales = ["W", "Y", "G", "R", "A", "Ł", "E", "Ś"]; //do wyświetlania na endingach

const historia = []; //do przechowywania histori ruchów by móc je cofać

const opcje = [document.getElementById("statystyki"), document.getElementById("poradnik"), document.getElementById("opcie"), document.getElementById("o-mnie")]; //opcjie headera 

const opcjeTab = []; // 0 - auto usupełnianie 1- opóżnenie auto uzupełniania 2-flexwrap 3-ilość kart w jednym kolorze 4- znaki kart 5- tryb manualny
sprawdzOpcie() 

function start(){//zaczyna lub resetuje nową grę
    console.log("start");
    rozegrane++;
    if(document.getElementById("start-button").innerHTML == "<h3>Zacznij od nowa</h3>") biezacy_streak = 0; //resetownaie strajka
    statystykiAktualizacjia();
    historia.length = 0;
    plansza = [];
    for(i = 1; i <= 7; i++){// generawnie odpowiedniej ilości staków, w teori mozna zmienić i wszytko będzie działać ale nietestowane
        plansza.push(new Stak);
    }
    holders = [];
    for(i = 1; i <= 4; i++){//generawnie odpowiedniej ilości holderów
        holders.push(new Stak("holder"));
    }
    endings = [];
    for(i = 1; i <= 4; i++){//generawnie odpowiedniej ilości endingów
        endings.push(new Stak("ending"));
    }
 
    var dek1 = [];//do zoptymalizowania
 
    stwozDek(dek1)
 
    dek1 = potasuj(dek1);
 
    rozluz(dek1, plansza)
 
    wypiszNaStronie()
    console.log(plansza[1].tab[5])
    document.getElementById("start-button").innerHTML = "<h3>Zacznij od nowa</h3>"; //zmiana przcisku
}
 
function wykonaj(podane = false, ile, Stak1, Stak2){ //zmienianie kart miescami, ile - ile kart chcesz przenieść, stak1- kolumna z ktorej przenosimy, stak2 - na którą przenosimy
    if(podane == false){ // true - tryb manulan (stworzon najpierw)
        ile = parseInt(document.getElementById("ile").value);
        Stak1 = parseInt(document.getElementById("k1").value);
        Stak2 = parseInt(document.getElementById("k2").value);
    }

    if(Stak2 != -1){ // sprawdzanie czy niepamiętam co to byłos
        //po kolei warunki na przeniesienie (bardzo potrzeba optymalizacji)
        if(Stak1 < 100 && Stak2 < 100 &&plansza[Stak1].tab.length != 0 && Stak1 >= 0 && Stak2 >= 0 && Stak1 <= plansza.length && Stak2 <= plansza.length && ile <= plansza[Stak1].tab.length){
            przeluz(ile, plansza[Stak1], plansza[Stak2]); // z planszy na planszę
            console.log("0")
        }
        else if(Stak1 >= 100 && holders[Stak1-100].tab != 0 && Stak1 < 1000 && Stak2 < 100){
            console.log("1")
            przeluz(1, holders[Stak1-100], plansza[Stak2]); // z holdera na planszę
        }
        else if(Stak2 >= 100 && Stak2 < 1000 && Stak2-1000 < endings.length && Stak1 < 100){
            console.log("2")
    
            przeluz(1, plansza[Stak1], holders[Stak2 - 100]); // z planszy na holder
        }
        else if(Stak1 >= 100 && Stak1 < 1000 && Stak2 >= 1000 && endings[Stak2 - 1000].tab.length == 0 && holders[Stak1 - 100].tab[holders[Stak1 - 100].tab.length-1].liczba == 1){
            console.log("3");
            endings[Stak2 - 1000].tab.push(holders[Stak1 - 100].tab[holders[Stak1 - 100].tab.length-1]);
            holders[Stak1 - 100].tab.pop(); // z holdera na ending gdy ending jest pusty
        }
        else if(Stak1 >= 100 && Stak1 < 1000 && Stak2 >= 1000 && holders[Stak1 - 100].tab[holders[Stak1 - 100].tab.length-1].liczba == endings[Stak2 - 1000].tab[endings[Stak2 - 1000].tab.length - 1].liczba + 1 && endings[Stak2 - 1000].tab[endings[Stak2 - 1000].tab.length - 1].kolor == holders[Stak1 - 100].tab[holders[Stak1 - 100].tab.length-1].kolor){
            console.log("4");
            endings[Stak2 - 1000].tab.push(holders[Stak1 - 100].tab[holders[Stak1 - 100].tab.length-1]);
            holders[Stak1 - 100].tab.pop(); // z holdera na enginga
        }
        else if(Stak1 < 100 && Stak2 >= 1000 && endings[Stak2 - 1000].tab.length == 0 && plansza[Stak1].tab[plansza[Stak1].tab.length - 1].liczba == 1){
            console.log("5")
            endings[Stak2 - 1000].tab.push(plansza[Stak1].tab[plansza[Stak1].tab.length-1]);
            plansza[Stak1].tab.pop(); // z planszy na endning gdy ending jest pusty
        }
        else if(Stak1 < 100 && Stak2 >= 1000 && endings[Stak2 - 1000].tab.length != 0 && endings[Stak2 - 1000].tab[endings[Stak2 - 1000].tab.length - 1].liczba+1 == plansza[Stak1].tab[plansza[Stak1].tab.length - 1].liczba && endings[Stak2 - 1000].tab[endings[Stak2 - 1000].tab.length - 1].kolor == plansza[Stak1].tab[plansza[Stak1].tab.length - 1].kolor){
            console.log("6")
            endings[Stak2 - 1000].tab.push(plansza[Stak1].tab[plansza[Stak1].tab.length-1]);
            plansza[Stak1].tab.pop(); // z planszy na ending
        }
        else if(Stak1 >= 100 && Stak1 < 1000 && Stak2 >= 100 && Stak2 < 1000 && holders[Stak2 - 100].tab.length == 0){
            console.log("7")
            przeluz(1, holders[Stak1 - 100], holders[Stak2 - 100]); // z holdera na holder gdy holder jest pusty
        }
        else {
            console.log("zle dane");
            return;
        }
    }
    else {
        console.log("baedzo zle dane");
        return;
    }
 
    wypiszNaStronie() // tworzy graficzną reprezenacjie

    historia.push([ile, Stak1, Stak2]); ///dodawanie ruchu do histori

    let wygrana = true;
    for(i = 0; i < endings.length; i++){
        if(endings[i].tab.length != opcjeTab[3]) wygrana = false; // zxmienić żeby wygrac z inną ilością kart 
    }

    if(wygrana){ // wygrana
        wygrane++;
        biezacy_streak++;
        statystykiAktualizacjia();
        document.getElementById("start-button").innerHTML = "<h3>Start</h3>";
        setTimeout(alert("Wygrałeś"), 250); 
    }
}




function przeluz(ile, Stak1, Stak2, ending = false, ignoruj = false){ //pzekładanie kart, bardzo ograniiczone
    let fine = true;
    if(!ending){ //jezeli to nie ending
        for(i = 1; i < ile; i++){
            fine = sprawdzKarty(Stak1.tab[Stak1.tab.length-(i)], Stak1.tab[Stak1.tab.length-(1+i)]);
        }
    }
    if(Stak2.tab.length == 0 || (fine == true && sprawdzKarty(Stak1.tab[Stak1.tab.length-ile], Stak2.tab[Stak2.tab.length-1], ending)) || ignoruj){
        console.log("przeszlo przez if");
        for(i = 0; i < ile; i++){
            Stak2.tab.push(Stak1.tab[Stak1.tab.length-(ile-i)]);
        }
        for(i = 0; i < ile; i++){
            Stak1.tab.pop();
        }
    }
    else console.log("ERROR 1")
}
 
function sprawdzKarty(karta1, karta2, ending = false){ //sprawdz czy można przenieść (źle zrobione)
    if(ending == false){
        if((parseInt(karta1.liczba)+1 == parseInt(karta2.liczba) && (parseInt(karta1.kolor) % 2) != (parseInt(karta2.kolor) % 2)) || karta2 === undefined) return true;
        else {
            console.log("co kurde");
            return false;
        }
    }
    else{
        if((parseInt(karta1.liczba)+1 == parseInt(karta2.liczba) && parseInt(karta1.kolor) == parseInt(karta2.kolor)) || karta2 === undefined) return true;
        else {
            console.log("co kurde2");
            return false;
        } 
    }
 
}
 
function stwozDek(dek){ //tworzenie nowego deku
    for(i = 1; i <= opcjeTab[3]; i++){ //zmiana ilości kart 
        for(j = 0; j <= 3; j++) //zmiana ilości kolorów kart
        {
            let k  = new Karta(j, i);
            dek.push(k);
        }
    }
}
 
function potasuj(dek) { //tasowanie deku
    for (i = dek.length - 1; i > 0; i--) {
        let n = Math.floor(Math.random() * (i + 1));
        [dek[i], dek[n]] = [dek[n], dek[i]];
    }
    return dek;
}
 
function rozluz(dek, plansza){// rozkładanie deku po równo na tablicy żeby każdy stak miał równo
    let index = 0;
    for(j = 0; j < plansza.length; j++){
        for(i = 0; i <= Math.floor(dek.length / plansza.length)-1; i++){
            plansza[j].tab[i] = dek[index];
            index += 1;
        }
    }
    if(index < dek.length){//dodawanie dodatkowych jeżeli zostały jakieś
        for(i = 0; i < dek.length - index; i++){
            plansza[i].tab.push(dek[dek.length - (dek.length - index) + i]);
        }
    }
}
 
function wypiszNaStronie() { //za długie, wypisywanie wszystkiego na stronie
    aktualizowanieDragablenosci();
    obsługaAutoUzupelnianiaHoldery()
    let CzyLata = false; //czy jakaś karta jest teraz przenoszona
    let Stak2 = -1; //jeżeli stak docelowy nie jest podany taka wartość będzie podana żeb się nie zwaliło
    tablica.innerHTML = "";//czyszczenie tablic
    for (let i = 0; i < plansza.length; i++) {
        const stakHTML = document.createElement("div"); // tworzenie stak html
        stakHTML.setAttribute("class", "stak");
        if(plansza[i].tab.length != 0){ //jezeli stak nie jest pusty
            for (let j = 0; j < plansza[i].tab.length; j++) {
                const kartaHTML = document.createElement("div");//tworzenie karty html
                if(plansza[i].tab[j].dragable){ //jezeli jest dragable (może być przeniesionwa)
                    if(plansza[i].tab[j].kolor % 2 == 0) kartaHTML.setAttribute("class", "nowy dragable czerwony"); //odppownienia klasa od koloru
                    else kartaHTML.setAttribute("class", "nowy dragable czarny");
                    kartaHTML.addEventListener("mousemove", () => { // dodanie listenera któr sprawdza jak na karcie jest kursor(nie że jest przenoszona)
                        if(CzyLata != kartaHTML && CzyLata != false){ // jeżeli karta nie jest tą przenoszoną ale jest na niej kursor gdy inna jest
                            Stak2 = i;
                        }
                    });
    
                    kartaHTML.addEventListener("mousedown", () =>{ //jeżeli się na nią kliknie (jest podniesiona)
                        kartaHTML.style.pointerEvents = "none"; //żeby wyższy lisner się nie włączał na tą karte
                        console.log("wcisniete");
                        CzyLata = kartaHTML; //potrzebne do tego wyżej 
                        if(plansza[i].tab.length == 1){ //jeżeli to ostatnia karta
                            let emptyKarta = document.createElement("div"); //tworzy karte żeby stak się nie kurczył
                            emptyKarta.setAttribute("class", "nowy empty");
                            stakHTML.appendChild(emptyKarta);
                        }
                        const onMouseMoveNaDokumenice = (event) => { //wykrywanie czy ruszamy myszką w trakcie gdy trzymamy przycisk na karcie
                            console.log("przesuwane");
                            kartaHTML.style.position = "absolute";
                            kartaHTML.style.left = (event.clientX+window.scrollX) + "px"; //przesuwanie karty razem z krusorem
                            kartaHTML.style.top = (event.clientY+window.scrollY) + "px";
                        };
     
                        document.addEventListener("mousemove", onMouseMoveNaDokumenice); //dodanie tego do dokumencie żeby działało wszędzei na stronie
     
                        document.addEventListener("mouseup", () =>{ // jeżeli odkłdamy kartę
                            kartaHTML.style.pointerEvents = "auto";
                            wykonaj(true, plansza[i].tab.length-j, i, Stak2); //próbujemy przenieść karte w to miejsce (jeżeli jest w złym miejscu to dane są złe i tamte ify to wykryją)
                            document.removeEventListener("mousemove", onMouseMoveNaDokumenice);
                            wypiszNaStronie(); //zaktualizowanie tego na stronie
                        }, { once: true }); //żeby się wykonała raz
                    });
                }
                else{
                    if(plansza[i].tab[j].kolor % 2 == 0) kartaHTML.setAttribute("class", "nowy czerwony"); // jeżeli karta nie jest dragable
                    else kartaHTML.setAttribute("class", "nowy czarny");
                }
                //ryswoanie karty
                const h3_1 = document.createElement("h3");
                const h1 = document.createElement("h1");
                const h3_2 = document.createElement("h3");

                h3_1.innerHTML = `${plansza[i].tab[j].liczba}`;
                h1.innerHTML = `${plansza[i].tab[j].liczba}`;
                h3_2.innerHTML = `${plansza[i].tab[j].liczba}`;

                if(opcjeTab[4]){ //jeżeli opcja ze znakami na kartach jest włączona
                    switch(plansza[i].tab[j].liczba){
                        case 11:
                            h3_1.innerHTML = "J";
                            h1.innerHTML = "J";
                            h3_2.innerHTML = "J";
                            break;
                        case 12:
                            h3_1.innerHTML = "Q";
                            h1.innerHTML = "Q";
                            h3_2.innerHTML = "Q";
                            break;
                        case 13:
                            h3_1.innerHTML = "K";
                            h1.innerHTML = "K";
                            h3_2.innerHTML = "K";
                            break;
                        case 1:
                            h3_1.innerHTML = "A";
                            h1.innerHTML = "A";
                            h3_2.innerHTML = "A";
                            break;
                    }
                }
     
                const img1 = document.createElement("img");
                img1.setAttribute("src", `assets/${plansza[i].tab[j].kolor}.png`);
                img1.setAttribute("alt", plansza[i].tab[j].kolor);
                
                const img2 = document.createElement("img");
                img2.setAttribute("src", `assets/${plansza[i].tab[j].kolor}.png`);
                img2.setAttribute("alt", plansza[i].tab[j].kolor);

                if(plansza[i].tab.length > (window.innerHeight-200)/150) { //kurczenie się staków jeżeli okno przeglądarki jest za duże
                    kartaHTML.style.top = 0 - ((((plansza[i].tab.length - ((window.innerHeight-200)/150))/plansza[i].tab.length)*125*j)+5) + "px";
                }
                kartaHTML.appendChild(h3_1);
                kartaHTML.appendChild(img1);
                kartaHTML.appendChild(h1);
                kartaHTML.appendChild(img2);
                kartaHTML.appendChild(h3_2);
                stakHTML.appendChild(kartaHTML);
                //koniec rysowania karty
            }
        }
        else { //jeżeli stak jest pusty
            const kartaHTML = document.createElement("div");
            kartaHTML.setAttribute("class", "nowy empty");
            kartaHTML.innerHTML = "<h3>"+tablicaWygrales[i]+"</h3>"; // wyświetlanie wygranłeś na końcu
            kartaHTML.addEventListener("mousemove", () => {
                if(CzyLata != kartaHTML && CzyLata != false) Stak2 = i;
            });
            stakHTML.appendChild(kartaHTML);
        }
        tablica.appendChild(stakHTML);
    }
 
    holdery.innerHTML = ""; //wszystko działa na podobnej zasadzie
    for(i = 0; i < holders.length; i++){
        const kartaHTML = document.createElement("div");
        kartaHTML.setAttribute("id", i);
        if(holders[i].tab.length != 0){
            if(holders[i].tab[0].kolor % 2 == 0) kartaHTML.setAttribute("class", "nowy dragable czerwony");
            else kartaHTML.setAttribute("class", "nowy dragable czarny");
            kartaHTML.addEventListener("mousedown", () =>{
                kartaHTML.style.pointerEvents = "none";
                console.log("wcisniete");
                CzyLata = kartaHTML;
                let emptyKarta = document.createElement("div");//
                emptyKarta.setAttribute("class", "nowy empty");// nieznikanie znikanie staku w trakcjie przenoesznia ostatniej karty
                holdery.appendChild(emptyKarta);                //  
                const onMouseMoveNaDokumenice = (event) => {
                    console.log("przesuwane");
                    kartaHTML.style.position = "absolute";
                    kartaHTML.style.left = (event.clientX+window.scrollX) + "px";
                    kartaHTML.style.top = (event.clientY+window.scrollY) + "px";
                };

                document.addEventListener("mousemove", onMouseMoveNaDokumenice);

                document.addEventListener("mouseup", () =>{
                    kartaHTML.style.pointerEvents = "auto";
                    console.log("podniesione");
                    document.removeEventListener("mousemove", onMouseMoveNaDokumenice);
                    wykonaj(true, 1, parseInt(kartaHTML.id)+100 , Stak2); // i jest złe (już nie)

                    wypiszNaStronie();
                }, { once: true });
            });

            const h3_1 = document.createElement("h3");
            const h1 = document.createElement("h1");
            const h3_2 = document.createElement("h3");
            h3_1.innerHTML = `${holders[i].tab[0].liczba}`;
            h1.innerHTML = `${holders[i].tab[0].liczba}`;
            h3_2.innerHTML = `${holders[i].tab[0].liczba}`;
            if(opcjeTab[4]){
                switch(holders[i].tab[0].liczba){
                    case 11:
                        h3_1.innerHTML = "J";
                        h1.innerHTML = "J";
                        h3_2.innerHTML = "J";
                        break;
                    case 12:
                        h3_1.innerHTML = "Q";
                        h1.innerHTML = "Q";
                        h3_2.innerHTML = "Q";
                        break;
                    case 13:
                        h3_1.innerHTML = "K";
                        h1.innerHTML = "K";
                        h3_2.innerHTML = "K";
                        break;
                    case 1:
                        h3_1.innerHTML = "A";
                        h1.innerHTML = "A";
                        h3_2.innerHTML = "A";
                        break;
                }
            }


            const img1 = document.createElement("img");
            img1.setAttribute("src", `assets/${holders[i].tab[0].kolor}.png`);
            img1.setAttribute("alt", holders[i].tab[0].kolor);
            
            const img2 = document.createElement("img");
            img2.setAttribute("src", `assets/${holders[i].tab[0].kolor}.png`);
            img2.setAttribute("alt", holders[i].tab[0].kolor);

            kartaHTML.appendChild(h3_1);
            kartaHTML.appendChild(img1);
            kartaHTML.appendChild(h1);
            kartaHTML.appendChild(img2);
            kartaHTML.appendChild(h3_2);
            holdery.appendChild(kartaHTML);
        }
        else {
            kartaHTML.setAttribute("class", "nowy empty");
            kartaHTML.setAttribute("id", i);
            kartaHTML.addEventListener("mousemove", () => {
                if(CzyLata != kartaHTML && CzyLata != false) Stak2 = parseInt(kartaHTML.id)+100;
            });
            holdery.appendChild(kartaHTML);
        }
    }

    endingi.innerHTML = "";
    for(i = 0; i < endings.length; i++){
        const kartaHTML = document.createElement("div");
        if(endings[i].tab.length != 0){
            endings[i].tab[endings[i].tab.length-1].dragable = false;
            if(endings[i].tab[endings[i].tab.length-1].kolor % 2 == 0) kartaHTML.setAttribute("class", "nowy czerwony");
            else kartaHTML.setAttribute("class", "nowy czarny");
            kartaHTML.setAttribute("id", i);
            kartaHTML.addEventListener("mousemove", () => {
                if(CzyLata != kartaHTML && CzyLata != false){
                    Stak2 = parseInt(kartaHTML.id)+1000;
                }
            });
    
            const h3_1 = document.createElement("h3");
            const h1 = document.createElement("h1");
            const h3_2 = document.createElement("h3");

            h3_1.innerHTML = `${endings[i].tab[endings[i].tab.length-1].liczba}`;
            h1.innerHTML = `${endings[i].tab[endings[i].tab.length-1].liczba}`;
            h3_2.innerHTML = `${endings[i].tab[endings[i].tab.length-1].liczba}`;
 
            if(opcjeTab[4]){
                switch(endings[i].tab[endings[i].tab.length-1].liczbaa){
                    case 11:
                        h3_1.innerHTML = "J";
                        h1.innerHTML = "J";
                        h3_2.innerHTML = "J";
                        break;
                    case 12:
                        h3_1.innerHTML = "Q";
                        h1.innerHTML = "Q";
                        h3_2.innerHTML = "Q";
                        break;
                    case 13:
                        h3_1.innerHTML = "K";
                        h1.innerHTML = "K";
                        h3_2.innerHTML = "K";
                        break;
                    case 1:
                        h3_1.innerHTML = "A";
                        h1.innerHTML = "A";
                        h3_2.innerHTML = "A";
                        break;
                }
            }

            const img1 = document.createElement("img");
            img1.setAttribute("src", `assets/${endings[i].tab[endings[i].tab.length-1].kolor}.png`);
            img1.setAttribute("alt", endings[i].tab[endings[i].tab.length-1].kolor);
            
            const img2 = document.createElement("img");
            img2.setAttribute("src", `assets/${endings[i].tab[endings[i].tab.length-1].kolor}.png`);
            img2.setAttribute("alt", endings[i].tab[endings[i].tab.length-1].kolor);

            kartaHTML.appendChild(h3_1);
            kartaHTML.appendChild(img1);
            kartaHTML.appendChild(h1);
            kartaHTML.appendChild(img2);
            kartaHTML.appendChild(h3_2);
            endingi.appendChild(kartaHTML);
        }
        else {
            kartaHTML.setAttribute("class", "nowy empty");
            kartaHTML.setAttribute("id", i);
            kartaHTML.addEventListener("mousemove", () => {
                if(CzyLata != kartaHTML && CzyLata != false) Stak2 = parseInt(kartaHTML.id)+1000;
            });
            endingi.appendChild(kartaHTML);
        }
    }
}

function aktualizowanieDragablenosci(){//aktualizowanie dragablenosci kart
    for(i = 0; i < plansza.length; i++){
        let napewnonie = false;
        for(j = plansza[i].tab.length-1; j >= 0; j--){// pętla idzie od tyłu bo jest to najbardziej optymalne
            if(!napewnonie){//jeżeli jakaś karta w staku nie jest dragable to poprzednie na pewno też nie są
                if(j == plansza[i].tab.length-1){ //ostatnia karta
                    if(plansza[i].tab[j] == undefined){
                        plansza[i].tab[j].tab.pop();
                    }
                    plansza[i].tab[j].dragable = true;
                    obsługaAutoUzupelniania(i , j);
                }
                else if(plansza[i].tab[j].liczba == plansza[i].tab[j+1].liczba+1 && plansza[i].tab[j].kolor % 2 != plansza[i].tab[j+1].kolor % 2){
                    plansza[i].tab[j].dragable = true;
                }
                else{
                    plansza[i].tab[j].dragable = false;
                    napewnonie = true;
                }
            }
            else plansza[i].tab[j].dragable = false;
        }
    }
}
 
function statystykiAktualizacjia(){ //aktualizowanie ciasteczek i sekcji statystyki

    if(biezacy_streak > najlepszy_streak) najlepszy_streak = biezacy_streak;

    document.cookie = `wygrane=${wygrane}; max-age=6048000; path=/`;
    document.cookie = `rozegrane=${rozegrane}; max-age=604800; path=/`;
    document.cookie = `biezacy_streak=${biezacy_streak}; max-age=604800; path=/`;
    document.cookie = `najlepszy_streak=${najlepszy_streak}; max-age=604800; path=/`;

    document.getElementById("wygrane").innerHTML = `Wygrane: ${wygrane}`;
    document.getElementById("rozegrane").innerHTML = `Rozegrane: ${rozegrane}`;
    document.getElementById("biezacy_streak").innerHTML = `Bieżący streak: ${biezacy_streak}`;
    document.getElementById("najlepszy_streak").innerHTML = `Najlepszy streak: ${najlepszy_streak}`;
}

function opcjieHeader(x){ //przełączanie się pomiędzy zakładkami
    if(opcje[x].style.display == "block"){
        for(i = 0; i < opcje.length; i++){
            opcje[i].style.display = "none";
        }
        //zmniejszenie marginu
        document.getElementById("tablica").style.marginLeft = "10px";
    }
    else{
        for(i = 0; i < opcje.length; i++){
            opcje[i].style.display = "none";
        }
        opcje[x].style.display = "block";
        document.getElementById("tablica").style.marginLeft = "350px";
    }
}

function autoUzupelnianie(cyfra){ // true / false czy można uzupełniać (jeżeli wszystkie jednynki są zebrane dopiero wtedy zacznie dwójki)
    let minLvl = 13; // najmniejszy lvl karty na endingu
    for(k = 0; k < endings.length; k++) {
        if(endings[k].tab.length == 0){
            minLvl = 1;
        }
        else if(endings[k].tab[endings[k].tab.length-1].liczba < minLvl) minLvl = endings[k].tab[endings[k].tab.length-1].liczba+1;
    }
    if(cyfra == minLvl) return true;
    else return false;
}

async function obsługaAutoUzupelniania(i , j){ // bardzo niezoptymalizowane i głupie
    if(opcjeTab[0] == false) return;
    if(autoUzupelnianie(plansza[i].tab[j].liczba)) {// true / false
        await new Promise(r => setTimeout(function(){
            for(k = 0; k < endings.length; k++){ //sprwadzanie w którym endingu jest odpowiedni kolor
                if(endings[k].tab[0] == undefined || (plansza[i].tab[j] != undefined && plansza[i].tab[j].kolor == endings[k].tab[0].kolor)){
                    console.log("wykonuje się w nieskończonej: "+i+", "+(k+1000))
                    wykonaj(true, 1, i, (k+1000));
                    break;
                }
            }
            r();
        }, 250));
    }
}

async function obsługaAutoUzupelnianiaHoldery(){ // to samo co wyżej ale dla holderów i mniej głupie
    if(opcjeTab[0] == false) return;
    for(var i = 0; i < holders.length; i++){
        if(holders[i].tab.length != 0){
            if(autoUzupelnianie(holders[i].tab[0].liczba)) {// true / false
                await new Promise(r => setTimeout(function(){
                    for(k = 0; k < endings.length; k++){ //sprwadzanie w którym endingu jest odpowiedni kolor
                        if(endings[k].tab[0] == undefined || (holders[i].tab[0] != undefined && holders[i].tab[0].kolor == endings[k].tab[0].kolor)){
                            console.log("wykonuje się w nieskończonej: "+(i+100)+", "+(k+1000))
                            wykonaj(true, 1, (i+100), (k+1000));
                            break;
                        }
                    }
                    r();
                }, opcjeTab[1]));
            }
        }
    }
}

function cofanieRuchu(){ // cofanie ruchu duhh słaba logika ale działa
    if(historia.length == 0) return;
    let ruch = historia.pop();
    let pomocnicza;

    if(ruch[2] >= 1000){
        pomocnicza = endings[ruch[2] - 1000];
        console.log("1");
    } else if(ruch[2] >= 100){
        pomocnicza = holders[ruch[2] - 100];  
        console.log("2");

    }
    else{
        pomocnicza = plansza[ruch[2]];
        console.log("3");
    }

    if(ruch[1] >= 1000){
        przeluz(ruch[0], pomocnicza, endings[ruch[1] - 1000], false, true);
    }
    else if(ruch[1] >= 100){
        przeluz(ruch[0], pomocnicza, holders[ruch[1] - 100], false, true);
    }
    else{
        przeluz(ruch[0], pomocnicza, plansza[ruch[1]], false, true);

    }

    wypiszNaStronie();
    console.log("jak to działa 2")
    opcjieTab[0] = false;
}

function sprawdzOpcie(){
    opcjeTab[0] = document.getElementById("auto").checked; //jest
    opcjeTab[1] = parseInt(document.getElementById("auto-opuznienie").value); //jest
    opcjeTab[2] = document.getElementById("flexwrap").checked; 
    opcjeTab[3] = parseInt(document.getElementById("ile-kart").value); //jest
    opcjeTab[4] = document.getElementById("znaki").checked;
    opcjeTab[5] = document.getElementById("manual").checked;

    if(opcjeTab[2]) tablica.style.flexWrap = "wrap";
    else tablica.style.flexWrap = "nowrap";

    if(opcjeTab[5]) document.getElementById("manualny-GUI").style.display = "block";
    else document.getElementById("manualny-GUI").style.display = "none";
    opcje[2].style.height = "fit-content";
    start();
} 
//714 linijek rekord