/* Lenguajes soportados*/
import eses from './es-es.json' with { type: 'json' };
import engb from './en-gb.json' with { type: 'json' };
import enus from './en-us.json' with { type: 'json' };
import esla from './es-la.json' with { type: 'json' };
import fr from './fr.json' with { type: 'json' };
import de from './de.json' with { type: 'json' };
import it from './it.json' with { type: 'json' };
import da from './da.json' with { type: 'json' };
import pt from './pt.json' with { type: 'json' };
import ptbr from './pt-br.json' with { type: 'json' };
import bg from './bg.json' with { type: 'json' };
import ru from './ru.json' with { type: 'json' };
import zhcn from './zh-cn.json' with { type: 'json' };
import zhtw from './zh-tw.json' with { type: 'json' };
import ja from './ja.json' with { type: 'json' };
import ko from './ko.json' with { type: 'json' };

const languages = {
	eses,
	esla,
	engb,
	enus,
	fr,
	de,
	it,
	da,
	pt,
	ptbr,
	bg,
	ru,
	zhcn,
	zhtw,
	ja,
	ko
};

// Función para obtener el texto traducido.
export const translate = (key: string) => {
	
	const keys = key.split('/');

	let value = (languages as any)[sessionStorage.getItem("language") || "engb"];

	for (const k of keys) {
	value = value?.[k];
	}

	return value || key;
}