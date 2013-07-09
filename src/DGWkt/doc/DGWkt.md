## L.DG.Wkt

Используется для получения геометрии API карт на основе ее описания в [WKT-формате](http://en.wikipedia.org/wiki/Well-known_text).

### Конструктор

<table>
    <tr>
        <th>Конструктор</th>
        <th>Использование</th>
        <th>Описание</th>
    </tr>
    <tr>
        <td><code><b>L.DG.wkt</b>(
            <nobr> <i>options?</i> )</nobr>
        </code></td>

        <td>
            <code>L.DG.wkt(&hellip;)</code>
        </td>

        <td>Создает объект, отвечающий за обработку данных в WKT-формате.</td>
    </tr>
</table>

### Опции

<table>
    <tr>
        <th>Опция</th>
        <th>Тип</th>
        <th>По умолчанию</th>
        <th>Описание</th>
    </tr>
    <tr>
        <td><code><b>initializer</b></code></td>
        <td><code>String</code></td>
        <td>null</td>
        <td>Данные в WKT-формате (опционально).</td>
    </tr>
</table>

### Методы

<table>
    <tr>
        <th>Метод</th>
        <th>Возвращает</th>
        <th>Описание</th>
    </tr>
    <tr>
        <td><code><b>read</b>(
            <nobr>&lt;String&gt; <i>wkt</i>)</nobr>
        </code></td>

        <td><code>Array</code></td>
        <td>Считывает строку в WKT-формате и проверяет ее корректность. Возвращает массив компонентов геометрии (ее внутреннее представление).</td>
    </tr>
    <tr>
        <td><code><b>toObject</b>(
            <nobr>&lt;Object&gt; <i>config</i></nobr> )
            )</code></td>
        <td><code>Object</code></td>
        <td>Формирует геометрию API карт на основе данных, считанных методом read. Этот метод поддерживает все параметры конструктора класса <a href="https://github.com/2gis/maps-api-2.0/blob/master/src/DGCore/doc/DGCustomization.md#lpath">L.Path</a>. Например, можно передать параметр <code>toObject({clickable:false})</code>, чтобы сделать геометрию некликабельной.</td>
    </tr>
    <tr>
        <td><code><b>write</b>(
            <nobr>&lt;Array&gt; <i>components</i></nobr> )
        </code></td>
        <td><code>String</code></td>
        <td>Возвращает WKT-описание на основе компонентов геометрии (ее внутреннего представления).</td>
    </tr>
</table>