var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var carros = new List<Carro>
{
    new Carro(1, "Volkswagen", "Virtus", 2019, 67000m),
    new Carro(2, "Hyundai", "HB20", 2021, 58000m)

};

app.MapGet("/", () => "API está no ar");

app.MapGet("/api/carros", () =>
{
    return Results.Ok(carros);
});

app.MapGet("/api/carros/{id:int}",(int id) =>
{
    var carroEncontrado = carros.Find(carro => carro.id == id);
    if (carroEncontrado is null)
    {
        return Results.NotFound();
    }
    return Results.Ok(carroEncontrado);
} );

app.MapPost("/api/carros" , (CriarCarroDTO dados) =>
{
    int proximoId = carros.Count +1;
    var novoCarro = new Carro(proximoId, dados.marca , dados.nome, dados.ano, dados.valor);
    carros.Add(novoCarro);
    return Results.Created($"/api/carros/{novoCarro.id}", novoCarro);
});

app.MapPut("/api/carros/{id:int}", (int id , AtualizarCarroDTO dados) =>
{
    int indice = carros.FindIndex(Carro => Carro.id == id);
    if (indice == -1)
    {
        return Results.NotFound();
    }

    var carroAntigo = carros[indice];

    var carroAtualizado = new Carro(
        id,
        dados.marca ?? carroAntigo.marca,
        dados.nome ?? carroAntigo.nome,
        dados.ano.HasValue && dados.ano > 0 ? dados.ano.Value : carroAntigo.ano,
        dados.valor.HasValue && dados.valor > 0 ? dados.valor.Value : carroAntigo.valor);
    
    carros[indice] = carroAtualizado;
    return Results.Ok(carroAtualizado);
});

app.MapDelete("/api/carros/{id:int}", (int id) =>
{
    int indice = carros.FindIndex(Carro => Carro.id == id);
    if (indice == -1)
    {
        return Results.NotFound();
    }
    carros.RemoveAt(indice);
    return Results.NoContent();
});


app.Run();

record Carro (int id, string marca, string nome, int ano, decimal valor);

record CriarCarroDTO (string marca, string nome, int ano, decimal valor);

record AtualizarCarroDTO (string? marca, string? nome, int? ano, decimal? valor);