<?php

/** @noinspection SlowArrayOperationsInLoopInspection */

use Illuminate\Support\Collection;

function dot($array, $prepend = '')
{
	$results = [];

	foreach ($array as $key => $value) {
		if (is_array($value) && ! empty($value)) {
			$results = array_merge($results, dot($value, $prepend.$key.'.'));
		} else {
			$results[$prepend.$key] = $value;
		}
	}

	return $results;
}

echo json_encode(dot(json_decode(file_get_contents('../resources/lang/en.json'), JSON_OBJECT_AS_ARRAY)), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
