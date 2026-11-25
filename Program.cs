using Microsoft.EntityFrameworkCore;
using ApiConcessionária.Models;
using ApiConcessionária.Data;



var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
    builder.Services.AddCors();
var app = builder.Build();
app.UseCors(policy => policy.AllowAnyOrigin()
    .AllowAnyHeader().AllowAnyMethod());

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            mensagem = "Ocorreu um erro interno. Tente novamente mais tarde."
        });
    });
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/carros", async (ApiDbContext db) =>
{
    var Veiculos = await db.Veiculos.ToListAsync();
    return Results.Ok(Veiculos); 
});

app.MapGet("/api/carros/{id:int}", async (int id, ApiDbContext db) =>
{
    var carroEncontrado = db.Veiculos.Find(id);
    if (carroEncontrado is null)
    {
        return Results.NotFound();
    }
    return Results.Ok(carroEncontrado);
} );

app.MapPost("/api/carros" , async (VeiculoEntity dados, ApiDbContext db) =>
{
    db.Veiculos.Add(dados);
    await db.SaveChangesAsync();
     return Results.Created($"/api/carros/{dados.id}", dados);

});


app.MapPut("/api/carros/{id:int}", async (int id , VeiculoEntity carroAtualizado , ApiDbContext db) =>
{
    var carro = await db.Veiculos.FindAsync(id);
    if (carro is null) return Results.NotFound();
    carro.marca = carroAtualizado.marca;
    carro.nome = carroAtualizado.nome;
    carro.ano = carroAtualizado.ano;
    carro.valor = carroAtualizado.valor;

    await db.SaveChangesAsync();
    return Results.Ok(carro);
   
});

app.MapDelete("/api/carros/{id:int}", async (int id, ApiDbContext db) =>
{
    var carro = await db.Veiculos.FindAsync(id);
    if (carro is null) return Results.NotFound();

    db.Veiculos.Remove(carro);
    await db.SaveChangesAsync();
    return Results.NoContent();
    
});



app.Run();





